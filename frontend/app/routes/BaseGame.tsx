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
  DialogContent,
  DialogActions,
} from "@mui/material";

import { ArrowDropUp, ArrowDropDown } from "@mui/icons-material";

import axios from "axios";

import web_url from "web-url";

import Decimal from "decimal.js";

interface DataPoint {
  time: number;
  value: string;
}

interface Player {
  id: string;
  role: string;
}

// global game variables
let NUMTICKSPERDAY: number = -1;
let TIMEBETWEENTICKS: number = -1;
let NUMTRADINGDAYS: number = -1;
let CASH: number = -1;
let VOLATILITY: number = -1;
let SEED: string = "";

const FAKEDATA: DataPoint[] = [];

const BaseGame = () => {
  const [gameId, setGameId] = useState<string>("");
  const [stockId, setStockId] = useState<string>("");
  const [players, setPlayers] = useState<Player[]>([]);

  // array to hold price of stock
  const [data, setData] = useState<DataPoint[]>(FAKEDATA);

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
  const [curTradingDay, setCurTradingDay] = useState<number>(-1);

  // stock broker text
  const [brokerText, setBrokerText] = useState<string>("");

  // current broker mode, either "Buy" or "Sell"
  // default is "Buy"
  const [brokerMode, setBrokerMode] = useState<string>("Buy");

  // flag to indicate if broker event listener is added
  const brokerListenerAdded = useRef(false);

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

  // toggle generation of data
  // if toggling on, add event listener
  const toggleDataGeneration = () => {
    setIsGeneratingData((prev) => {
      if (!prev) {
        if (!brokerListenerAdded.current) {
          document.addEventListener("keydown", handleBrokerText);
          brokerListenerAdded.current = true;
        } else {
          document.removeEventListener("keydown", handleBrokerText);
          brokerListenerAdded.current = false;
        }
      }
      return !prev;
    });
  };

  // creates a new base game
  const loadBaseGame = async () => {
    setIsSettingUp(true);
    // load in the game
    try {
      const response = await axios.get(`${web_url}/get-game-manager/`);
      let pastValues = response.data.game_manager[gameId].stock.past_values;
      console.log(response.data.game_manager[gameId]);
      setStockId(response.data.game_manager[gameId].stock.id);

      response.data.game_manager[gameId].players.forEach((player: Player) => {
        const newPlayer: Player = {
          id: player.id,
          role: player.role,
        };
        setPlayers((prev) => [...prev, newPlayer]);
      });
      const dayNumber = Math.max(
        Math.floor((pastValues.length - 11) / NUMTICKSPERDAY) + 1,
        1
      );
      setCurTradingDay(dayNumber);
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
      setCurTradingDay(0);
      setIsSettingUp(false);
      setIsInvalidGame(true);
      ticksGenerated.current = 0;
    }
  };

  // gets next data point
  const getNextDataPoint = async () => {
    try {
      const response = await axios.get(
        `${web_url}/get-next-base-game-price-solo/${gameId}/`
      );
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
  const handleEndOfDay = () => {
    document.addEventListener("keydown", openSummary);
  };

  // handle generation of data
  useEffect(() => {
    // no game registered yet
    if (!gameId || gameId == "") {
      return;
    }

    // start/resume generation of data
    if (isGeneratingData) {
      lastResumed.current = Date.now();

      // generate a new data point
      const generatePoint = async () => {
        // don't generate if game is currently paused
        const currentTime = Date.now();
        const next_price = await getNextDataPoint();

        minValue.current = Math.min(minValue.current, next_price);
        maxValue.current = Math.max(maxValue.current, next_price);
        setData((prevData) => {
          const newPoint: DataPoint = {
            time:
              prevData.length + 1 - 10 + (curTradingDay - 1) * NUMTICKSPERDAY,
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
            console.error("Error posting data:", error);
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

  const goToNextDay = () => {
    setOpenSummaryWindow(false);
    setStockStatus("Neutral");

    const lastTen = data.slice(-10);

    for (let i = 0; i < 10; i++) {
      lastTen[i].time = i - 9 + curTradingDay * NUMTICKSPERDAY;
    }

    setCurTradingDay((prev) => prev + 1);
    setData(lastTen);
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
    const gameSetup = JSON.parse(localStorage.getItem("gameSetup") || "");
    NUMTICKSPERDAY = parseInt(gameSetup.numTicksPerDay);
    NUMTRADINGDAYS = parseInt(gameSetup.numTradingDays);
    CASH = parseFloat(gameSetup.startingCash);
    TIMEBETWEENTICKS = parseFloat(gameSetup.timeBetweenTicks) * 1000;
    VOLATILITY = parseFloat(gameSetup.volatility);
    SEED = gameSetup.seed;
  }, []);

  useEffect(() => {
    if (gameId !== "") {
      loadBaseGame();
    }
  }, [gameId]);

  // handle broker text
  const handleBrokerText = (e: any) => {
    // complete transaction
    // only execute transaction if there is text in the broker
    if (e.key === "Enter") {
      setBrokerText((prev) => {
        if (prev.length > 0) {
          setBrokerBackgroundColor("bg-yellow-800/20");
          console.log("execute trade");
          return "";
        }
        return prev;
      });
    }

    if (e.key === "Backspace") {
      setBrokerText((prev) => prev.slice(0, -1));
    }

    if (e.key === "b" || e.key === "+") {
      setBrokerMode("Buy");
      setBrokerBackgroundColor("bg-green-800/20");
    }

    if (e.key === "s" || e.key === "-") {
      setBrokerMode("Sell");
      setBrokerBackgroundColor("bg-red-800/20");
    }
    // invalid key inputted
    if (e.key < "0" || e.key > "9") {
      return;
    }

    // update broker text
    // ignore leading 0's
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

  return (
    <>
      <div className="absolute right-0 w-1/3 h-1/2 border-1">
        recent transactions
      </div>

      <div className="absolute left-1/2 w-1/7">
        <h1>
          Cash:{" "}
          {CASH != -1 ? "$" + CASH.toFixed(2) : <CircularProgress size={20} />}
        </h1>
        <h1>Stocks Owned: {stocksOwned}</h1>
      </div>

      <h1>
        <div>
          Current Price:{" "}
          {data.length >= 1 ? (
            "$" + data[data.length - 1].value
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

      <h1>
        Game ID: {gameId !== "" ? gameId : <CircularProgress size={20} />}
      </h1>

      <h1>
        Stock ID: {stockId !== "" ? stockId : <CircularProgress size={20} />}
      </h1>

      <h1>
        Players:{" "}
        {players.length !== 0 ? (
          players.map((player) => (
            <div>
              ID: {player.id}, Role: {player.role}
            </div>
          ))
        ) : (
          <CircularProgress size={20} />
        )}
      </h1>

      <h1>
        Ticks Generated:{" "}
        {ticksGenerated.current != -1 ? (
          ticksGenerated.current
        ) : (
          <CircularProgress size={20} />
        )}
      </h1>

      <h1>
        Time Between Ticks:{" "}
        {TIMEBETWEENTICKS != -1 ? (
          TIMEBETWEENTICKS / 1000 + " second(s)"
        ) : (
          <CircularProgress size={20} />
        )}
      </h1>

      <h1>
        Ticks Per Day:{" "}
        {NUMTICKSPERDAY != -1 ? NUMTICKSPERDAY : <CircularProgress size={20} />}
      </h1>

      <h1>
        Trading Day{" "}
        {curTradingDay != -1 ? curTradingDay : <CircularProgress size={20} />}{" "}
        of{" "}
        {NUMTRADINGDAYS != -1 ? NUMTRADINGDAYS : <CircularProgress size={20} />}
      </h1>

      <Button
        onClick={toggleDataGeneration}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
          }
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
                        -9 + (curTradingDay - 1) * NUMTICKSPERDAY,
                        -5 + (curTradingDay - 1) * NUMTICKSPERDAY,
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
                            (curTradingDay - 1) * NUMTICKSPERDAY,
                        ])
                    : []
                }
              />

              <YAxis
                domain={[
                  Math.round(minValue.current * 0.9 * 100) / 100,
                  Math.round(maxValue.current * 1.1 * 100) / 100,
                ]}
                tickFormatter={(value) => value.toFixed(2)}
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
                x={(curTradingDay - 1) * NUMTICKSPERDAY}
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
        <DialogContent>Blah blah blah</DialogContent>
        <DialogActions>
          <Button onClick={goToNextDay}>Next Day</Button>
        </DialogActions>
      </Dialog>

      {/* Stock Broker */}
      {isGeneratingData ? (
        <div
          className={`absolute top-0 left-0 w-full h-full pointer-events-none flex items-center justify-center ${brokerBackgroundColor}`}
        >
          <h1
            className={`text-[156px]  ${
              brokerMode === "Buy" ? "text-green-500/40" : "text-red-500/40"
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

export default BaseGame;
