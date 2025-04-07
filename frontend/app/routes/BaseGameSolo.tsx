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
import { Button } from "@mui/material";

import axios from "axios";

import web_url from "web-url";

interface DataPoint {
  time: number;
  value: number;
}

// global game variables
let NUMTICKSPERDAY: number = -1;
let TIMEBETWEENTICKS: number = -1;
let NUMTRADINGDAYS: number = -1;
let CASH: number = -1;
let VOLATILITY: number = -1;
let SEED: string = "";

const FAKEDATA: DataPoint[] = [];

const BaseGameSolo = () => {
  // array to hold price of stock
  const [data, setData] = useState<DataPoint[]>(FAKEDATA);
  const [gameId, setGameId] = useState<String>("");

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

  // min and max values genereated so far, used to scale the axis
  const minValue = useRef<number>(Infinity);
  const maxValue = useRef<number>(-Infinity);

  const toggleDataGeneration = () => {
    setIsGeneratingData((prev) => !prev);
  };

  // creates a new base game
  const createNewBaseGame = async () => {
    const gameId = localStorage.getItem("gameId");
    if (gameId != null) {
      try {
        const response = await axios.get(`${web_url}/get-game-manager/`);
        const pastValues = response.data.game_manager[gameId].stock.past_values; 
        console.log(pastValues);
      } catch (error) {
        console.log("error gettig game manager:", error);
      }
    } else {
      try {
        const response = await axios.post(`${web_url}/create-base-game/`, {
          seed: SEED,
          total_ticks: NUMTICKSPERDAY * NUMTRADINGDAYS,
        });

        let initialData: DataPoint[] = [];
        response.data.initial_prices.forEach((price: number) => {
          const newDataPoint: DataPoint = {
            time: initialData.length + 1 - 10,
            value: price,
          };
          initialData.push(newDataPoint);
          minValue.current = Math.min(minValue.current, price);
          maxValue.current = Math.max(maxValue.current, price);
        });

        setData(initialData);

        setGameId(response.data.base_game.id);
        localStorage.setItem("gameId", response.data.base_game.id);
        console.log(response.data);
      } catch (error) {
        console.error("Error posting data:", error);
      }
    }
  };

  // registers the base game that was just created
  const registerGame = async () => {
    try {
      const response = await axios.post(
        `${web_url}/register-base-game/${gameId}/`
      );
    } catch (error) {
      console.error("Error posting data:", error);
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
      console.log(response.data);
    } catch (error) {
      console.error("Error posting data:", error);
    }
  };

  // when a new game gets created, register it
  useEffect(() => {
    if (gameId != "") {
      registerGame();
    }
  }, [gameId]);

  // handle generation of data
  useEffect(() => {
    // no game registered yet
    if (gameId == "") {
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
            time: prevData.length + 1 - 10,
            value: next_price,
          };
          return [...prevData, newPoint];
        });
        lastTimestamp.current = currentTime;
        isPaused.current = false;
        timeInTick.current = 0;
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
            console.log(response.data);
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

  useEffect(() => {
    // Check if we're in the browser environment
    if (typeof window !== "undefined") {
      const gameSetup = JSON.parse(localStorage.getItem("gameSetup") || "");
      console.log(gameSetup);
      NUMTICKSPERDAY = parseInt(gameSetup.numTicksPerDay);
      NUMTRADINGDAYS = parseInt(gameSetup.numTradingDays);
      CASH = parseFloat(gameSetup.startingCash);
      TIMEBETWEENTICKS = parseFloat(gameSetup.timeBetweenTicks) * 1000;
      VOLATILITY = parseFloat(gameSetup.volatility);
      SEED = gameSetup.seed;
      createNewBaseGame();
    }
  }, []);

  return (
    <>
      <h1>
        Current Price: {data.length >= 1 ? data[data.length - 1].value : 0}
      </h1>

      <Button
        onClick={toggleDataGeneration}
        disabled={gameId === "" || isResuming}
      >
        {isGeneratingData ? "Stop Data Generation" : "Start Data Generation"}
      </Button>

      <Button onClick={createNewBaseGame} disabled={gameId !== ""}>
        {" "}
        create new base game
      </Button>

      <div style={{ width: "50%", height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              type="number"
              domain={["dataMin", "dataMax"]}
            />
            <YAxis
              domain={[
                Math.round(minValue.current * 0.9 * 100) / 100,
                Math.round(maxValue.current * 1.1 * 100) / 100,
              ]}
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
              x={0}
              stroke="red"
              strokeWidth={2}
              strokeDasharray="3 3"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

export default BaseGameSolo;
