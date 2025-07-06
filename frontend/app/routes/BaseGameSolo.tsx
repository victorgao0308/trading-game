import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useState, useEffect, useRef } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Slide,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogActions,
} from "@mui/material";
import { ArrowDropUp, ArrowDropDown } from "@mui/icons-material";
import axios from "axios";
import web_url from "web-url";
import Decimal from "decimal.js";
import GameInfoModal from "~/components/GameInfoModal";
import OrderStatusList from "~/components/OrderStatusList";
import BaseGameSoloDescriptionModal from "~/components/BaseGameSoloDescriptionModal";

import { useNavigate } from "react-router";

interface DataPoint {
  time: number;
  value: string;
}

import type { Order } from "~/components/OrderStatus";

export interface Player {
  id: string;
  role: string;
}

// global game variables
let NUMTICKSPERDAY: number = -1;
let TIMEBETWEENTICKS: number = -1;
let NUMTRADINGDAYS: number = -1;
let VOLATILITY: number = -1;
let SEED: string = "";

const BaseGameSolo = () => {
  const [gameId, setGameId] = useState<string>("");
  const stockId = useRef<string>("");
  const players = useRef<Player[]>([]);

  // array to hold price of stock
  const [data, setData] = useState<DataPoint[]>([]);

  // state to control if data is being generated
  const [isGeneratingData, setIsGeneratingData] = useState<boolean>(false);

  // interval for data generation
  const interval = useRef<NodeJS.Timeout | undefined>(undefined);

  // timestamp of when last data point was generated
  const lastTimestamp = useRef<number | undefined>(undefined);

  // whether game is paused or not
  const isPaused = useRef<boolean>(false);

  // timestamp of when game was last resumed / started
  const lastResumed = useRef<number | undefined>(undefined);

  // time to next tick in ms (if paused)
  const timeToNextTick = useRef<number | undefined>(undefined);

  // total time spent during this tick (used to properly handle pausing)
  const timeInTick = useRef<number>(0);

  // indicates whether game is in process of resuming (generating next data point after a pause)
  // during this time, do not allow the user to pause the game again
  const [isResuming, setIsResuming] = useState<boolean>(false);

  // indicates whether game is being set up (making a new game or aing previous data)
  // when setting up, display a loading circle
  const [isSettingUp, setIsSettingUp] = useState<boolean>(false);

  // min and max values genereated so far, used to scale the axis
  const minValue = useRef<number>(Infinity);
  const maxValue = useRef<number>(-Infinity);

  // total number of ticks generated
  const ticksGenerated = useRef<number>(-1);

  // indicates whether we are in between trading days
  const [isBetweenDays, setIsBetweenDays] = useState<boolean>(false);

  // indicates if summary window is open or not
  const [openSummaryWindow, setOpenSummaryWindow] = useState<boolean>(false);

  // tracks current trading day
  const curTradingDay = useRef<number>(0);

  // stock broker text
  const [brokerText, setBrokerText] = useState<string>("");

  // current broker mode, either "Buy" or "Sell"
  // default is "Buy"
  const brokerMode = useRef<string>("Buy");

  // background color of the broker
  // contains a tailwind class name
  const [brokerBackgroundColor, setBrokerBackgroundColor] =
    useState<string>("");

  // current number of stocks owned by the player
  // must be an integer
  // negative values means the player is shorting the stock
  const [stocksOwned, setStocksOwned] = useState<number>(0);

  // stock status
  // Nuetral: stock is at same price compared to start of day
  // Above: stock is at higher price compared to start of day
  // Below: stock is at lower price compared to start of day
  const [stockStatus, setStockStatus] = useState<string>("Neutral");

  // change between current price of stock and price at start of day
  const [stockChange, setStockChange] = useState<Decimal>(Decimal(0));

  // indicates whether game id is valid or not
  const [isInvalidGame, setIsInvalidGame] = useState<boolean>(false);

  const [orders, setOrders] = useState<Order[]>([]);

  const [cash, setCash] = useState<number>(0);

  const currentPrice = useRef<number>(0);

  // number of pending orders
  // that have been deleted when loading a game in
  const [ordersDeleted, setOrdersDeleted] = useState<number>(0);

  // list of orders that is used in the summary screen
  const [summaryOrders, setSummaryOrders] = useState<Order[]>([]);

  // interest earned/gained on trading day by player
  const interestSummary = useRef<number[]>([0, 0]);

  const navigate = useNavigate();

  // toggle generation of data
  // if toggling on, add event listener
  const toggleDataGeneration = () => {
    if (ordersDeleted != 0) {
      setOrdersDeleted(0);
    }
    setIsGeneratingData((prev) => !prev);
  };

  const loadBaseGame = async () => {
    setIsSettingUp(true);
    // load in the game
    try {
      const response = await axios.get(`${web_url}/get-game-manager/`);
      const game = response.data.game_manager[gameId];
      let pastValues = game.stock.past_values;
      stockId.current = game.stock.id;
      const settings = game.settings;

      if (settings.game_type !== "Base game (solo)") {
        throw new Error("Game type does not match");
      }

      TIMEBETWEENTICKS = settings.time_between_ticks * 1000;
      NUMTICKSPERDAY = settings.num_ticks_per_day;
      NUMTRADINGDAYS = settings.num_trading_days;
      VOLATILITY = settings.volatility;
      SEED = settings.seed;

      loadOrders(game.stock.fulfilled_orders);

      // if stock has pending orders, remove them
      try {
        const response = await axios.delete(
          `${web_url}/remove-pending-orders/${game.stock.id}/`
        );
        setOrdersDeleted(response.data.orders_deleted);

        setTimeout(() => {
          setOrdersDeleted(0);
        }, 10000);
      } catch (error) {
        console.error("Error posting data:", error);
      }

      setCash(game.players[0].money);

      response.data.game_manager[gameId].players.forEach((player: any) => {
        const newPlayer: Player = {
          id: player.id,
          role: player.role,
        };
        players.current.push(newPlayer);
        if (player.role === "Player") {
          setStocksOwned(parseInt(player.owned_stocks[game.stock.id]) || 0);
        }
      });
      const dayNumber = Math.max(
        Math.floor((pastValues.length - 11) / NUMTICKSPERDAY) + 1,
        1
      );
      curTradingDay.current = dayNumber;
      ticksGenerated.current = pastValues.length - 10;
      const startingIndex = (dayNumber - 1) * NUMTICKSPERDAY;
      pastValues = pastValues.slice(startingIndex);

      // load in saved data from database
      let prevData: DataPoint[] = [];
      for (const price of pastValues) {
        const newDataPoint: DataPoint = {
          time: prevData.length + 1 - 10 + (dayNumber - 1) * NUMTICKSPERDAY,
          value: price.toFixed(2),
        };
        prevData.push(newDataPoint);
        minValue.current = Math.min(minValue.current, price);
        maxValue.current = Math.max(maxValue.current, price);
      }

      setData(prevData);
      const firstPriceOfDay = prevData[9].value;
      const lastPrice = prevData[prevData.length - 1].value;

      if (lastPrice > firstPriceOfDay) {
        setStockStatus("Above");
      } else if (lastPrice < firstPriceOfDay) {
        setStockStatus("Below");
      } else {
        setStockStatus("Neutral");
      }

      setStockChange(Decimal(lastPrice).minus(Decimal(firstPriceOfDay)));
      currentPrice.current = parseFloat(lastPrice);
      setIsSettingUp(false);

      if (
        ticksGenerated.current > 0 &&
        ticksGenerated.current % NUMTICKSPERDAY == 0
      ) {
        setIsBetweenDays(true);
        handleEndOfDay();
      }
    } catch (error) {
      console.error(
        "error getting game manager and loading previous data:",
        error
      );
      setData([{ time: 0, value: "0" }]);
      curTradingDay.current = 0;
      setIsSettingUp(false);
      setIsInvalidGame(true);
      ticksGenerated.current = 0;
    }

    // once game loads, attach event listener for the broker
    document.addEventListener("keydown", handleBrokerText);
  };

  // gets next data point
  const getNextDataPoint = async () => {
    try {
      const response = await axios.post(
        `${web_url}/get-next-base-game-price-solo/${gameId}/`,
        {
          trading_day: curTradingDay.current,
        }
      );
      setCash(response.data.player_cash);
      return response.data.price;
    } catch (error) {
      console.error("Error posting data:", error);
    }
  };

  // pauses the current game
  const pauseGame = async (timeToNextTick: number) => {
    try {
      const response = await axios.post(
        `${web_url}/pause-base-game/${gameId}/`,
        {
          time: timeToNextTick,
        }
      );
    } catch (error) {
      console.error("Error posting data:", error);
    }
  };

  const openSummary = () => {
    setOpenSummaryWindow(true);
    setIsBetweenDays(false);
    document.removeEventListener("keydown", openSummary);
  };

  // handle end of trading day
  const handleEndOfDay = async () => {
    try {
      const response = await axios.post(
        `${web_url}/get-orders-placed-on-day/`,
        {
          stock_id: stockId.current,
          trading_day: curTradingDay.current,
        }
      );

      let orders: Order[] = [];
      response.data.orders.forEach((order: any) => {
        const title =
          (order.quantity > 0 ? "Buy " : "Sell ") +
          Math.abs(order.quantity) +
          " @ $" +
          order.price.toFixed(2);
        const newOrder = {
          id: order.id,
          status: order.status,
          title: title,
          timestamp: order.timestamp,
        };
        orders.push(newOrder);
      });
      setSummaryOrders(orders);
    } catch (error) {
      console.error("Error posting data:", error);
    }

    try {
      const response = await axios.get(
        `${web_url}/get-interest-earned-and-paid/${players.current[0].id}/${curTradingDay.current}/`
      );
      interestSummary.current = [response.data.interest_earned, response.data.interest_paid]
    } catch (error) {
      console.error("Error getting interest earned/paid on trading:", error);
    }

    document.addEventListener("keydown", openSummary);
  };

  // transform the "fufilled orders" field into list of Order objects
  // since pending orders get removed, we only need to worry about the fulfilled ones
  const loadOrders = (fufilledOrders: any) => {
    fufilledOrders.forEach((order: any) => {
      const title =
        (order.quantity > 0 ? "Buy " : "Sell ") +
        Math.abs(order.quantity) +
        " @ $" +
        order.price.toFixed(2);
      const newOrder = {
        id: order.id,
        status: order.status,
        title: title,
        timestamp: order.timestamp,
      };
      setOrders((prev) => [newOrder, ...prev]);
    });
  };

  // handle generation of data
  useEffect(() => {
    // no game registered yet
    if (!gameId || gameId === "") {
      return;
    }

    // start/resume generation of data
    if (isGeneratingData) {
      lastResumed.current = Date.now();

      // generate a new data point
      const generatePoint = async () => {
        const currentTime = Date.now();
        const next_price = await getNextDataPoint();

        // update orders, from filled to confirmed, and confirmed to hidden (doesn't appear on list of recent orders)
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.status === "Order Filled"
              ? { ...order, status: "Order Confirmed" }
              : order
          )
        );
        minValue.current = Math.min(minValue.current, next_price);
        maxValue.current = Math.max(maxValue.current, next_price);
        setData((prevData) => {
          const newPoint: DataPoint = {
            time:
              prevData.length +
              1 -
              10 +
              (curTradingDay.current - 1) * NUMTICKSPERDAY,
            value: next_price.toFixed(2),
          };
          return [...prevData, newPoint];
        });

        const firstPriceOfDay = data[9].value;
        if (next_price > firstPriceOfDay) {
          setStockStatus("Above");
        } else if (next_price < firstPriceOfDay) {
          setStockStatus("Below");
        } else {
          setStockStatus("Neutral");
        }
        setStockChange(Decimal(next_price).minus(Decimal(firstPriceOfDay)));

        lastTimestamp.current = currentTime;
        isPaused.current = false;
        timeInTick.current = 0;

        ticksGenerated.current += 1;
        currentPrice.current = next_price;

        // end of trading day
        if (ticksGenerated.current % NUMTICKSPERDAY == 0) {
          setIsGeneratingData(false);
          setIsBetweenDays(true);
          handleEndOfDay();
        }
      };

      // handle resumption of game from when it was paused
      // isPaused prevents user from pausing the game again before next data point gets generated
      if (isPaused.current) {
        const handleResumption = async () => {
          setIsResuming(true);
          try {
            const response = await axios.post(
              `${web_url}/resume-base-game/${gameId}/`
            );
          } catch (error) {
            console.error("Error fetching summary for trading day:", error);
          }
          setTimeout(async () => {
            generatePoint();
            interval.current = setInterval(generatePoint, TIMEBETWEENTICKS);

            setIsResuming(false);
          }, Math.max(25, TIMEBETWEENTICKS - timeInTick.current));
        };
        handleResumption();
      } else {
        interval.current = setInterval(generatePoint, TIMEBETWEENTICKS);
      }
    } else {
      // pause generation of data
      // save the time remaining the to the next tick so that when the game becomes unpaused the time to
      // next tick does not restart
      const handlePause = async () => {
        const currentTime = Date.now();

        const lastResumedVal = lastResumed.current ? lastResumed.current : 0;
        const lastTimestampVal = lastTimestamp.current
          ? lastTimestamp.current
          : 0;

        if (isPaused.current) {
          timeInTick.current += currentTime - lastResumedVal;
        } else {
          timeInTick.current += currentTime - lastTimestampVal;
          isPaused.current = true;
        }

        const remainingTime = TIMEBETWEENTICKS - timeInTick.current;
        timeToNextTick.current = remainingTime;
        await pauseGame(remainingTime);
        clearInterval(interval.current);
      };

      handlePause();
    }

    // Cleanup interval when effect is removed or toggled off
    return () => {
      if (interval.current) clearInterval(interval.current);
    };
  }, [isGeneratingData]);

  // handles going to next trading day
  // gets 10 last data points from the previous day to use as the beginning 10 points and
  // updates meta information
  // resets broker

  const goToNextDay = () => {
    setOpenSummaryWindow(false);
    setStockStatus("Neutral");

    const lastTen = data.slice(-10);

    for (let i = 0; i < 10; i++) {
      lastTen[i].time = i - 9 + curTradingDay.current * NUMTICKSPERDAY;
    }

    curTradingDay.current += 1;
    setData(lastTen);
    setBrokerText("");
    brokerMode.current = "Buy";
    setBrokerBackgroundColor("bg-green-800/20");
  };

  // initial setup
  useEffect(() => {
    if (typeof window == undefined) {
      return;
    }

    const url = window.location.href;
    const urlParts = url.split("/");
    const id = urlParts[urlParts.length - 1];
    setGameId(id);
  }, []);

  useEffect(() => {
    if (gameId !== "") {
      loadBaseGame();
    }
  }, [gameId]);

  // handles end of the game
  // basically, just routes to component to display statistics
  const handleEndOfGame = () => {
    navigate(`/game-summary/${gameId}`);
  };

  // handle broker text
  const handleBrokerText = async (e: any) => {
    // don't allow usage of broker when game is paused
    if (isPaused.current) {
      return;
    }

    if (e.key === "Enter") {
      setBrokerText((prev) => {
        if (prev.length > 0) {
          const amount = parseInt(prev);
          const adjustedAmount =
            brokerMode.current === "Sell" ? -amount : amount;
          const price = currentPrice.current;

          (async () => {
            try {
              const response = await axios.post(
                `${web_url}/create-base-order/`,
                {
                  order_type: 0,
                  player_id: players.current[0].id,
                  game_id: gameId,
                  stock_id: stockId.current,
                  timestamp: new Date().toISOString(),
                  quantity: adjustedAmount,
                  price: price,
                  day_placed_on: curTradingDay.current,
                }
              );
              const order = response.data.order;
              const title =
                (order.quantity > 0 ? "Buy " : "Sell ") +
                Math.abs(order.quantity) +
                " @ $" +
                order.price.toFixed(2);
              const newOrder = {
                id: order.id,
                status: order.status,
                title: title,
                timestamp: Date().toString(),
              };
              // make newest order the first in the list, so that it appears at the top
              setOrders((prev) => [newOrder, ...prev]);
              setBrokerBackgroundColor("bg-yellow-800/20");
              setCash((prev) => prev - adjustedAmount * price);
              setStocksOwned((prev) => prev + adjustedAmount);
            } catch (e) {
              console.error(e);
            }
          })();

          return "";
        }
        return prev;
      });
      return;
    }

    if (e.key === "Backspace") {
      setBrokerText((prev) => prev.slice(0, -1));
      return;
    }

    if (e.key === "b" || e.key === "+") {
      brokerMode.current = "Buy";
      setBrokerBackgroundColor("bg-green-800/20");
      return;
    }

    if (e.key === "s" || e.key === "-") {
      brokerMode.current = "Sell";
      setBrokerBackgroundColor("bg-red-800/20");
      return;
    }

    // Allow only numeric keys
    if (e.key < "0" || e.key > "9") {
      return;
    }

    // Append number if not leading 0
    setBrokerText((prev) => {
      if (!(prev.length === 0 && e.key === "0")) {
        return prev + e.key;
      }
      return prev;
    });
  };

  // set broker background to default after a delay
  useEffect(() => {
    if (brokerBackgroundColor !== "") {
      setTimeout(() => {
        setBrokerBackgroundColor("");
      }, 150);
    }
  }, [brokerBackgroundColor]);

  // tick formatter for the line graph
  const formatNumber = (tick: number) => {
    if (tick >= 1e6) return `${(tick / 1e6).toFixed(2)}M`;
    if (tick >= 1e3) return `${(tick / 1e3).toFixed(2)}K`;
    return tick.toFixed(2);
  };

  return (
    <>
      {isSettingUp ? (
        <CircularProgress
          size={100}
          className="my-auto absolute top-0 right-30"
        />
      ) : (
        <OrderStatusList orders={orders} />
      )}

      <div className="flex flex-row">
        <div>
          <h1 className="ml-2">
            <div>
              Current Price:{" "}
              {!isSettingUp ? (
                "$" + currentPrice.current.toFixed(2)
              ) : (
                <CircularProgress size={20} />
              )}
              {stockStatus === "Above" ? (
                <ArrowDropUp className="text-green-600" />
              ) : stockStatus === "Below" ? (
                <ArrowDropDown className="text-red-600" />
              ) : (
                <></>
              )}
              {stockStatus !== "Neutral" ? (
                <span
                  className={
                    stockStatus === "Above" ? "text-green-600" : "text-red-600"
                  }
                >
                  {stockChange.toString() !== "0"
                    ? "$" + stockChange.toFixed(2)
                    : ""}
                </span>
              ) : (
                <></>
              )}
            </div>
          </h1>
          <h1 className="ml-2">
            Ticks Generated:{" "}
            {!isSettingUp ? (
              ticksGenerated.current
            ) : (
              <CircularProgress size={20} />
            )}
          </h1>
          <h1 className="ml-2">
            Time Between Ticks:{" "}
            {!isSettingUp ? (
              TIMEBETWEENTICKS / 1000 + " second(s)"
            ) : (
              <CircularProgress size={20} />
            )}
          </h1>
          <h1 className="ml-2">
            Ticks Per Day:{" "}
            {!isSettingUp ? NUMTICKSPERDAY : <CircularProgress size={20} />}
          </h1>
          <h1 className="ml-2">
            Trading Day{" "}
            {!isSettingUp ? (
              curTradingDay.current
            ) : (
              <CircularProgress size={20} />
            )}{" "}
            of {!isSettingUp ? NUMTRADINGDAYS : <CircularProgress size={20} />}
          </h1>
        </div>

        <div className="ml-10">
          <h1>
            Cash:{" "}
            {!isSettingUp ? (
              "$" + cash.toFixed(2)
            ) : (
              <CircularProgress size={20} />
            )}
          </h1>
          <h1>
            Stocks Owned: {stocksOwned} (worth $
            {(stocksOwned * currentPrice.current).toFixed(2)})
          </h1>
          <h1>
            Total Net Worth: $
            {(cash + stocksOwned * currentPrice.current).toFixed(2)}
          </h1>
        </div>
      </div>
      <GameInfoModal
        gameId={gameId}
        stockId={stockId.current}
        players={players.current}
      />
      <BaseGameSoloDescriptionModal />
      <Button
        onClick={toggleDataGeneration}
        onKeyDown={(e) => {
          e.preventDefault();
        }}
        disabled={gameId === "" || isResuming || isBetweenDays || isInvalidGame}
      >
        {isGeneratingData
          ? "Stop Data Generation (SpaceBar)"
          : "Start Data Generation (SpaceBar)"}
      </Button>
      <div style={{ width: "47.5%", height: 400 }}>
        <ResponsiveContainer
          width="100%"
          height="100%"
          className="flex justify-center"
        >
          {isSettingUp ? (
            <CircularProgress size={100} className="my-auto" />
          ) : (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                type="number"
                domain={["dataMin", "dataMax"]}
                ticks={
                  data.length > 9
                    ? [
                        -9 + (curTradingDay.current - 1) * NUMTICKSPERDAY,
                        -5 + (curTradingDay.current - 1) * NUMTICKSPERDAY,
                      ]
                        .concat(
                          Array.from(
                            {
                              length: Math.ceil(
                                (data[data.length - 1].time - data[9].time) / 5
                              ),
                            },
                            (_, i) => data[9].time + i * 5
                          )
                        )
                        .concat([
                          data.length -
                            10 +
                            (curTradingDay.current - 1) * NUMTICKSPERDAY,
                        ])
                    : []
                }
              />

              <YAxis
                domain={[
                  Math.round(minValue.current * 0.9 * 100) / 100,
                  Math.round(maxValue.current * 1.1 * 100) / 100,
                ]}
                tickFormatter={formatNumber}
              />

              {isGeneratingData ? <></> : <Tooltip />}
              <Line
                type="linear"
                dataKey="value"
                stroke="#000000"
                dot={true}
                isAnimationActive={false}
              />
              <ReferenceLine
                x={(curTradingDay.current - 1) * NUMTICKSPERDAY}
                stroke="red"
                strokeWidth={2}
                strokeDasharray="3 3"
              />
              <ReferenceLine
                y={data.length > 9 ? data[9].value : 0}
                stroke="gray"
                strokeWidth={2}
                strokeDasharray="4 4"
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={ordersDeleted > 0}
        message="Trading day ended."
        slots={{ transition: Slide }}
        slotProps={{
          transition: {
            direction: "left",
          },
        }}
      >
        <Alert
          severity="warning"
          sx={{ width: "400px", fontSize: "1.1rem", py: 2 }}
        >
          {ordersDeleted == 1
            ? "1 pending order was deleted."
            : `${ordersDeleted} pending orders were deleted.`}{" "}
          {
            "Orders get put into pending status when they are filled, and get put into completed status at the game tick immediately after when the order was placed."
          }
        </Alert>
      </Snackbar>

      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={isBetweenDays}
        message="Trading day ended."
        slots={{ transition: Slide }}
        slotProps={{
          transition: {
            direction: "left",
          },
        }}
      >
        <Alert
          severity="warning"
          sx={{ width: "400px", fontSize: "1.1rem", py: 2 }}
        >
          Trading day ended. Press any key to continue to the summary screen.
        </Alert>
      </Snackbar>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={isInvalidGame}
        message="Invalid Game Id."
        slots={{ transition: Slide }}
        slotProps={{
          transition: {
            direction: "left",
          },
        }}
      >
        <Alert
          severity="error"
          sx={{ width: "400px", fontSize: "1.1rem", py: 2 }}
        >
          Game ID is invalid. Please try again, or create a new game.
        </Alert>
      </Snackbar>
      <Dialog open={openSummaryWindow}>
        <DialogTitle>Summary of Trading Day</DialogTitle>
        <h1>Orders Placed Today</h1>
        {summaryOrders.map((order) => (
          <h1 key={order.id}>{order.title}</h1>
        ))}
        <h1>Interest</h1>
        <h2>Interest Earned Today: ${interestSummary.current[0].toFixed(2)}</h2>
        <h2>Interest Paid Today: ${interestSummary.current[1].toFixed(2)}</h2>
        <DialogActions>
          {curTradingDay.current === NUMTRADINGDAYS ? (
            <Button onClick={handleEndOfGame}>View Summary</Button>
          ) : (
            <Button onClick={goToNextDay}>Next Day</Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Stock Broker */}
      {isGeneratingData ? (
        <div
          className={`absolute top-0 left-0 w-full h-full pointer-events-none flex items-center justify-center ${brokerBackgroundColor}`}
        >
          <h1
            className={`text-[156px]  ${
              brokerMode.current === "Buy"
                ? "text-green-500/40"
                : "text-red-500/40"
            } font-bold`}
          >
            {brokerText}
          </h1>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

export default BaseGameSolo;
