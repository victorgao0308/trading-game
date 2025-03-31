import { useState } from "react";
import { Button, Paper } from "@mui/material";
import { ArrowBack, ArrowForward, InfoOutline } from "@mui/icons-material";
import { Divider, TextField, Tooltip } from "@mui/material";
import { motion } from "framer-motion";

const gameModes = ["Base Game (Solo)", "Base Game (Regular)"];
const descriptions = [
  "Base game with no bots. Stock prices are derived from historical stock prices, random in-game events, and your actions. You are able to directly buy/sell stock at the listed price.",
  "Base game where you trade against bots. Stock prices are derived from historical stock prices, random in-game events, and current supply/demand. You are able to create various types of buy/sell orders, and trades are only executed when orders can be fulfilled.",
  "c",
];

const GameModeSelector = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const handlePrevious = () => {
    setDirection(-1);
    setSelectedIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : gameModes.length - 1
    );
  };

  const handleNext = () => {
    setDirection(1);
    setSelectedIndex((prevIndex) =>
      prevIndex < gameModes.length - 1 ? prevIndex + 1 : 0
    );
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Paper className="p-6 w-2/5 shadow-lg bg-white rounded-lg text-center flex flex-col items-center">
        <h2 className="text-xl font-bold mb-4">Create New Game</h2>
        <Divider className="w-full font-bold" variant="fullWidth">
          Game Mode
        </Divider>
        <div className="flex items-center w-full justify-between overflow-hidden relative">
          <Button onClick={handlePrevious} className="!text-black p-2">
            <ArrowBack />
          </Button>
          <motion.div
            key={selectedIndex}
            initial={{ opacity: 0, x: direction * 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -direction * 10 }}
            transition={{ duration: 0.3 }}
            className="text-m font-semibold p-2 rounded-md text-center"
          >
            {gameModes[selectedIndex]}
          </motion.div>
          <Button onClick={handleNext} className="!text-black p-2">
            <ArrowForward />
          </Button>
        </div>
        <motion.div
          key={selectedIndex}
          initial={{ opacity: 0, x: direction * 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -direction * 10 }}
          transition={{ duration: 0.3 }}
          className="text-sm pb-3 rounded-md text-center"
        >
          {descriptions[selectedIndex]}
        </motion.div>
        <Divider className="w-full font-bold" variant="fullWidth">
          Game Settings
        </Divider>

        {selectedIndex != 0 ? (
          <>
            <div className="flex justify-between items-center w-full">
              <span>
                Number of Bots{" "}
                <Tooltip
                  title="Number of bots to play against. Bots act like players and can execute trades. Enter an integer 1 - 100."
                  className="mb-0.5"
                >
                  <InfoOutline fontSize="small" />
                </Tooltip>
              </span>

              <TextField
                id="num-bots"
                variant="outlined"
                size="small"
                className="w-20"
                value={1}
              />
            </div>
            <div className="flex justify-between items-center w-full">
              <span>
                Number of Market Makers{" "}
                <Tooltip
                  title="Number of bots to designate as market makers. Market makers provide liquidity by creating bid/ask spreads. Number must be less than or equal to the number of bots. (It is recommended to have 10% of your bots be market makers). Enter an integer 1 - Number of Bots."
                  className="mb-0.5"
                >
                  <InfoOutline fontSize="small" />
                </Tooltip>
              </span>

              <TextField
                id="num-mms"
                variant="outlined"
                size="small"
                className="w-20"
                value={1}
              />
            </div>
          </>
        ) : (
          <></>
        )}

        <div className="flex justify-between items-center w-full">
          <span>
            Number of Trading Days
            <Tooltip
              title="Number of trading days in the game. The game ends after the specified number of trading days. Enter an integer 1 - 30."
              className="mb-0.5"
            >
              <InfoOutline fontSize="small" />
            </Tooltip>
          </span>

          <TextField
            id="num-trading-days"
            variant="outlined"
            size="small"
            className="w-20"
            value={10}
          />
        </div>
        <div className="flex justify-between items-center w-full">
          <span>
            Number of Ticks per Day
            <Tooltip
              title="Number ticks per trading day. A tick is an update in stock price. Enter an intgeger 1 - 120."
              className="mb-0.5"
            >
              <InfoOutline fontSize="small" />
            </Tooltip>
          </span>
          <TextField
            id="num-ticks"
            variant="outlined"
            size="small"
            className="w-20"
            value={1}
          />
        </div>
        <div className="flex justify-between items-center w-full">
          <span>
            Time Between Ticks (seconds)
            <Tooltip
              title="Time (in seconds) between each stock tick. Enter a number 0.1 - 5."
              className="mb-0.5"
            >
              <InfoOutline fontSize="small" />
            </Tooltip>
          </span>
          <TextField
            id="time-between-ticks"
            variant="outlined"
            size="small"
            className="w-20"
            value={1}
          />
        </div>
        <div className="flex justify-between items-center w-full">
          <span>
            Starting Cash
            <Tooltip
              title="How much cash you (and bots if applicable) start with. Enter a number 1000 - 1000000."
              className="mb-0.5"
            >
              <InfoOutline fontSize="small" />
            </Tooltip>
          </span>
          <TextField
            id="starting-cash"
            variant="outlined"
            size="small"
            className="w-20"
            value={1}
          />
        </div>
        <div className="flex justify-between items-center w-full">
          <span>
            Volatility
            <Tooltip
              title="Controls how volatile the stock is. A higher value means the stock is more likely to experience larger price swings. Enter a number 1 - 100."
              className="mb-0.5"
            >
              <InfoOutline fontSize="small" />
            </Tooltip>
          </span>
          <TextField
            id="volatility"
            variant="outlined"
            size="small"
            className="w-20"
            value={1}
          />
        </div>
        <div className="flex justify-between items-center w-full">
          <span>
            Seed
            <Tooltip
              title="Seed that controls random events in game and actions performed by bots. Leave blank for random."
              className="mb-0.5"
            >
              <InfoOutline fontSize="small" />
            </Tooltip>
          </span>
          <TextField
            id="seed"
            variant="outlined"
            size="small"
            className="w-20"
          />
        </div>
        <Button
          variant="contained"
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Create
        </Button>
      </Paper>
    </div>
  );
};

export default GameModeSelector;
