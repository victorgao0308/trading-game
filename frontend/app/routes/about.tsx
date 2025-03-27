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

interface DataPoint {
  time: number;
  value: number;
}

const DATARATE = 1000;

const FAKEDATA = [
  {
    time: 1,
    value: 5,
  },
  {
    time: 2,
    value: 10,
  },
  {
    time: 3,
    value: 10,
  },
  {
    time: 4,
    value: 20,
  },
  {
    time: 5,
    value: 15,
  },
];

const RealTimeLineGraph = () => {
  const [data, setData] = useState<DataPoint[]>(FAKEDATA);

  // state to control if data is being generated
  const [isGeneratingData, setIsGeneratingData] = useState<boolean>(false);

  const toggleDataGeneration = () => {
    setIsGeneratingData((prev) => !prev);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    // generate data
    if (isGeneratingData) {
      interval = setInterval(() => {
        setData((prevData) => {
          const newPoint: DataPoint = {
            time: prevData.length + 1,
            value: Math.random() * 100,
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
      <div style={{ width: "60%", height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              type="number"
              domain={["dataMin", "dataMax"]}
            />
            <YAxis domain={[0, 100]} />

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

export default RealTimeLineGraph;
