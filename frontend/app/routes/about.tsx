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

const RealTimeLineGraph = () => {
  const [data, setData] = useState<DataPoint[]>([
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
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prevData) => {
        const newPoint: DataPoint = {
          time: prevData.length + 1,
          value: Math.random() * 100,
        };
        return [...prevData, newPoint];
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ width: "60%", height: 400 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" type="number" domain={["dataMin", "dataMax"]} />
          <YAxis domain={[0, 100]} />
          {/* <Tooltip /> */}
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
  );
};

export default RealTimeLineGraph;
