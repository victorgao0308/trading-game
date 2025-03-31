import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
  } from "recharts";
  import { useState, useEffect } from "react";
  import axios from "axios";
  
  import web_url from "web-url";
  
  interface DataPoint {
    time: number;
    value: number;
  }
  
  const DATARATE = 1000;
  
  const FAKEDATA: DataPoint[] = [];
  
  const base_game_solo = () => {
    /* ---------------------USESTATES------------------------ */
  
    // array to hold price of stock
    const [data, setData] = useState<DataPoint[]>(FAKEDATA);
    const [gameId, setGameId] = useState<String>("");
    // state to control if data is being generated
    const [isGeneratingData, setIsGeneratingData] = useState<boolean>(false);
  
    const toggleDataGeneration = () => {
      setIsGeneratingData((prev) => !prev);
    };
  
    /* ----------------------AXIOS CALLS--------------------- */
  
    // creates a new base game
    const createNewBaseGame = async () => {
      try {
        const response = await axios.post(`${web_url}/create-base-game/`);
        setGameId(response.data.base_game.id);
      } catch (error) {
        console.error("Error posting data:", error);
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
        return(response.data.price);
      } catch (error) {
        console.error("Error posting data:", error);
      }
    };
  
    /* ----------------------USE EFFECTS--------------------- */
    // when a new game gets created, register it
    useEffect(() => {
      if (gameId != "") {
        registerGame();
      }
    }, [gameId]);
  
    // loop to generate new data
    useEffect(() => {
      let interval: NodeJS.Timeout | undefined;
  
      // generate data
      if (isGeneratingData) {
        interval = setInterval(async () => {
          const next_price = await getNextDataPoint();
  
          setData((prevData) => {
            const newPoint: DataPoint = {
              time: prevData.length + 1,
              value: next_price,
            };
            return [...prevData, newPoint];
          });
        }, DATARATE);
      } else {
        clearInterval(interval);
      }
  
      // Cleanup interval when effect is removed or toggled off
      return () => {
        if (interval) clearInterval(interval);
      };
    }, [isGeneratingData]);
  
    return (
      <>
        <h1>Current Price: </h1>
        <button onClick={toggleDataGeneration}>
          {isGeneratingData ? "Stop Data Generation" : "Start Data Generation"}
        </button>
  
        <button onClick={createNewBaseGame}>create new base game</button>
  
        <div style={{ width: "65%", height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                type="number"
                domain={["dataMin", "dataMax"]}
              />
              <YAxis />
  
              {isGeneratingData ? <></> : <Tooltip />}
              <Line
                type="linear"
                dataKey="value"
                stroke="#000000"
                dot={true}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </>
    );
  };
  
export default base_game_solo;