import { useEffect, useState } from "react";

import { Button, Paper } from "@mui/material";
import { ArrowBack, ArrowForward, InfoOutline } from "@mui/icons-material";
import { Divider, TextField, Tooltip } from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";

const gameModes = ["Tutorial", "Base Game (Solo)", "Base Game (Regular)"];
const descriptions = [
  "Learn how to play the game!",
  "Base game with no bots. Stock prices are derived from historical stock prices, random in-game events, and your actions. You are able to directly buy/sell stock at the listed price.",
  "Base game where you trade against bots. Stock prices are derived from historical stock prices, random in-game events, and current supply/demand. You are able to create various types of buy/sell orders, and trades are only executed when orders can be fulfilled.",
  "c",
];

const CreateGame = () => {
  const games = Object.freeze({
    TUTORIAL: 0,
    BASE_GAME_SOLO: 1,
    BASE_GAME_REGULAR: 2,
  });

  const navigate = useNavigate();

  // whether the menu has been loaded and configured
  const [isLoaded, setIsLoaded] = useState(false);

  // selected index for game mode
  const [selectedIndex, setSelectedIndex] = useState<number>(games.TUTORIAL);

  // tracks whether or not the user has moved the selection for the game mode
  // this prevents the "fade in" animation upon page load
  const [hasMovedSelection, setHasMovedSelection] = useState(false);
  const [direction, setDirection] = useState(0);

  // useStates for input boxes, error states, and error messages
  const [numBots, setNumBots] = useState("30");
  const [numBotsError, setNumBotsError] = useState(false);
  const [numBotsMessage, setNumBotsMessage] = useState("");

  const [numMM, setNumMM] = useState("3");
  const [numMMError, setNumMMError] = useState(false);
  const [numMMMessage, setNumMMMessage] = useState("");

  const [numTradingDays, setNumTradingDays] = useState("15");
  const [numTradingDaysError, setNumTradingDaysError] = useState(false);
  const [numTradingDaysMessage, setNumTradingDaysMessage] = useState("");

  const [numTicksPerDay, setNumTicksPerDay] = useState("60");
  const [numTicksPerDayError, setNumTicksPerDayError] = useState(false);
  const [numTicksPerDayMessage, setNumTicksPerDayMessage] = useState("");

  const [timeBetweenTicks, setTimeBetweenTicks] = useState("1");
  const [timeBetweenTicksError, setTimeBetweenTicksError] = useState(false);
  const [timeBetweenTicksMessage, setTimeBetweenTicksMessage] = useState("");

  const [startingCash, setStartingCash] = useState("1000");
  const [startingCashError, setStartingCashError] = useState(false);
  const [startingCashMessage, setStartingCashMessage] = useState("");

  const [volatility, setVolatility] = useState("10");
  const [volatilityError, setVolatilityError] = useState(false);
  const [volatilityMessage, setVolatilityMessage] = useState("");

  const [seed, setSeed] = useState("");

  // handlers for scrolling left/right on game type
  const handlePrevious = () => {
    setDirection(-1);
    setHasMovedSelection(true);
    setSelectedIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : gameModes.length - 1
    );
  };

  const handleNext = () => {
    setDirection(1);
    setHasMovedSelection(true);
    setSelectedIndex((prevIndex) =>
      prevIndex < gameModes.length - 1 ? prevIndex + 1 : 0
    );
  };

  // set game parameters for the tutorial
  useEffect(() => {
    if (selectedIndex == games.TUTORIAL) {
      setNumTradingDays("3");
      setNumTicksPerDay("30");
      setTimeBetweenTicks("1");
      setStartingCash("1500");
      setVolatility("1");
      setSeed("");
      setIsLoaded(true);
    }
  }, [selectedIndex]);

  // handlers for updating text fields
  const handleNumBots = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNumBots(e.target.value);
  };

  const handleNumMM = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNumMM(e.target.value);
  };

  const handleNumTradingDays = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNumTradingDays(e.target.value);
  };

  const handleNumTicksPerDay = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNumTicksPerDay(e.target.value);
  };

  const handleTimeBetweenTicks = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTimeBetweenTicks(e.target.value);
  };

  const handleStartingCash = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartingCash(e.target.value);
  };

  const handleVolatility = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolatility(e.target.value);
  };

  const handleSeed = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSeed(e.target.value);
  };

  // validators for text fields
  useEffect(() => {
    validateNumBots();
    validateNumMM();
  }, [numBots]);

  const validateNumBots = () => {
    const val = parseInt(numBots);
    if (isNaN(val) || val < 1 || val > 100) {
      setNumBotsError(true);
      setNumBotsMessage("Enter an integer 1 - 100");
    } else {
      setNumBotsError(false);
      setNumBotsMessage("");
    }
  };

  useEffect(() => {
    validateNumMM();
  }, [numMM]);

  const validateNumMM = () => {
    const val = parseInt(numMM);
    if (isNaN(val) || val < 1 || val > parseInt(numBots)) {
      setNumMMError(true);
      setNumMMMessage("Enter an integer 1 - Number of Bots");
    } else {
      setNumMMError(false);
      setNumMMMessage("");
    }
  };

  useEffect(() => {
    validateNumTradingDays();
  }, [numTradingDays]);

  const validateNumTradingDays = () => {
    const val = parseInt(numTradingDays);
    if (isNaN(val) || val < 1 || val > 30) {
      setNumTradingDaysError(true);
      setNumTradingDaysMessage("Enter an integer 1 - 30");
    } else {
      setNumTradingDaysError(false);
      setNumTradingDaysMessage("");
    }
  };

  useEffect(() => {
    validateNumTicksPerDay();
  }, [numTicksPerDay]);

  const validateNumTicksPerDay = () => {
    const val = parseInt(numTicksPerDay);
    if (isNaN(val) || val < 1 || val > 120) {
      setNumTicksPerDayError(true);
      setNumTicksPerDayMessage("Enter an integer 1 - 120");
    } else {
      setNumTicksPerDayError(false);
      setNumTicksPerDayMessage("");
    }
  };

  useEffect(() => {
    validateTimeBetweenTicks();
  }, [timeBetweenTicks]);

  const validateTimeBetweenTicks = () => {
    const val = parseFloat(timeBetweenTicks);
    if (isNaN(val) || val < 0.1 || val > 5) {
      setTimeBetweenTicksError(true);
      setTimeBetweenTicksMessage("Enter a value 0.1 - 5");
    } else {
      setTimeBetweenTicksError(false);
      setTimeBetweenTicksMessage("");
    }
  };

  useEffect(() => {
    validateStartingCash();
  }, [startingCash]);

  const validateStartingCash = () => {
    const val = parseInt(startingCash);
    if (isNaN(val) || val < 1000 || val > 1000000) {
      setStartingCashError(true);
      setStartingCashMessage("Enter an integer 1,000 - 1,000,000");
    } else {
      setStartingCashError(false);
      setStartingCashMessage("");
    }
  };

  useEffect(() => {
    validateVolatility();
  }, [volatility]);

  const validateVolatility = () => {
    const val = parseFloat(volatility);
    if (isNaN(val) || val < 1 || val > 100) {
      setVolatilityError(true);
      setVolatilityMessage("Enter a value integer 1 - 100");
    } else {
      setVolatilityError(false);
      setVolatilityMessage("");
    }
  };

  // validate all fields when submitting form
  const validateInputs = () => {
    validateNumBots();
    validateNumMM();
    validateNumTradingDays();
    validateNumTicksPerDay();
    validateTimeBetweenTicks();
    validateStartingCash();
    validateVolatility();

    if (
      selectedIndex == games.BASE_GAME_SOLO &&
      (numTradingDaysError ||
        numTicksPerDayError ||
        timeBetweenTicksError ||
        startingCashError ||
        volatilityError)
    ) {
      return;
    } else if (
      selectedIndex == games.BASE_GAME_REGULAR &&
      (numBotsError ||
        numMMError ||
        numTradingDaysError ||
        numTicksPerDayError ||
        timeBetweenTicksError ||
        startingCashError ||
        volatilityError)
    ) {
      return;
    }

    let gameSetup: {
      numTradingDays: string;
      numTicksPerDay: string;
      timeBetweenTicks: string;
      startingCash: string;
      volatility: string;
      seed: string;
      [key: string]: any;
    } = {
      numTradingDays,
      numTicksPerDay,
      timeBetweenTicks,
      startingCash,
      volatility,
      seed,
    };

    if (selectedIndex == games.BASE_GAME_REGULAR) {
      gameSetup.numBots = numBots;
      gameSetup.numMM = numMM;
    }

    localStorage.setItem("gameSetup", JSON.stringify(gameSetup));
    navigate("/game");
  };

  return (
    <div className="flex justify-center items-center my-12 ">
      <Paper className="p-6 w-2/5 shadow-lg bg-white rounded-lg text-center flex flex-col items-center">
        {isLoaded ? (
          <>
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
                initial={{
                  opacity: hasMovedSelection ? 0 : 1,
                  x: direction * 10,
                }}
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
              initial={{
                opacity: hasMovedSelection ? 0 : 1,
                x: direction * 10,
              }}
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

            {selectedIndex == games.BASE_GAME_REGULAR ? (
              <>
                <div className="flex justify-between items-center w-full mb-1">
                  <span>
                    Number of Bots{" "}
                    <Tooltip
                      title="Number of bots to play against. Bots act like players and can execute trades. Enter an integer 1 - 100."
                      className="mb-0.5 ml-1"
                    >
                      <InfoOutline fontSize="small" />
                    </Tooltip>
                  </span>

                  <TextField
                    id="num-bots"
                    variant="outlined"
                    type="number"
                    size="small"
                    className="w-20"
                    value={numBots}
                    onChange={handleNumBots}
                    error={numBotsError}
                    helperText={numBotsMessage}
                    sx={{
                      "& .MuiFormHelperText-root": {
                        fontSize: ".6rem",
                        margin: "0",
                        display: "block",
                        whiteSpace: "normal",
                        width: "12rem",
                        marginLeft: "-7rem",
                        textAlign: "right",
                      },
                    }}
                  />
                </div>
                <div className="flex justify-between items-center w-full mb-1">
                  <span>
                    Number of Market Makers{" "}
                    <Tooltip
                      title={`Number of bots to designate as market makers. Market makers provide liquidity by creating bid/ask spreads. 
                  Number must be less than or equal to the number of bots. (It is recommended to have 10% of your bots be market makers). 
                  Enter an integer 1 - Number of Bots`}
                      className="mb-0.5 ml-1"
                    >
                      <InfoOutline fontSize="small" />
                    </Tooltip>
                  </span>

                  <TextField
                    id="num-mms"
                    variant="outlined"
                    size="small"
                    className="w-20"
                    value={numMM}
                    onChange={handleNumMM}
                    type="number"
                    error={numMMError}
                    helperText={numMMMessage}
                    sx={{
                      "& .MuiFormHelperText-root": {
                        fontSize: ".6rem",
                        margin: "0",
                        display: "block",
                        whiteSpace: "normal",
                        width: "12rem",
                        marginLeft: "-7rem",
                        textAlign: "right",
                      },
                    }}
                  />
                </div>
              </>
            ) : (
              <></>
            )}

            <div className="flex justify-between items-center w-full mb-1">
              <span>
                Number of Trading Days
                <Tooltip
                  title="Number of trading days in the game. The game ends after the specified number of trading days. Enter an integer 1 - 30."
                  className="mb-0.5 ml-1"
                >
                  <InfoOutline fontSize="small" />
                </Tooltip>
              </span>

              <TextField
                id="num-trading-days"
                variant="outlined"
                size="small"
                className="w-20"
                value={numTradingDays}
                type="number"
                onChange={handleNumTradingDays}
                error={numTradingDaysError}
                helperText={numTradingDaysMessage}
                disabled={selectedIndex == games.TUTORIAL}
                sx={{
                  "& .MuiFormHelperText-root": {
                    fontSize: ".6rem",
                    margin: "0",
                    display: "block",
                    whiteSpace: "normal",
                    width: "12rem",
                    marginLeft: "-7rem",
                    textAlign: "right",
                  },
                }}
              />
            </div>

            <div className="flex justify-between items-center w-full mb-1">
              <span>
                Number of Ticks per Day
                <Tooltip
                  title="Number ticks per trading day. A tick is an update in stock price. Enter an integer 1 - 120."
                  className="mb-0.5 ml-1"
                >
                  <InfoOutline fontSize="small" />
                </Tooltip>
              </span>
              <TextField
                id="num-ticks"
                variant="outlined"
                size="small"
                className="w-20"
                value={numTicksPerDay}
                onChange={handleNumTicksPerDay}
                type="number"
                error={numTicksPerDayError}
                helperText={numTicksPerDayMessage}
                disabled={selectedIndex == games.TUTORIAL}
                sx={{
                  "& .MuiFormHelperText-root": {
                    fontSize: ".6rem",
                    margin: "0",
                    display: "block",
                    whiteSpace: "normal",
                    width: "12rem",
                    marginLeft: "-7rem",
                    textAlign: "right",
                  },
                }}
              />
            </div>
            <div className="flex justify-between items-center w-full mb-1">
              <span>
                Time Between Ticks (seconds)
                <Tooltip
                  title="Time (in seconds) between each stock tick. Enter a number 0.1 - 5."
                  className="mb-0.5 ml-1"
                >
                  <InfoOutline fontSize="small" />
                </Tooltip>
              </span>
              <TextField
                id="time-between-ticks"
                variant="outlined"
                size="small"
                className="w-20"
                value={timeBetweenTicks}
                onChange={handleTimeBetweenTicks}
                type="number"
                error={timeBetweenTicksError}
                helperText={timeBetweenTicksMessage}
                disabled={selectedIndex == games.TUTORIAL}
                sx={{
                  "& .MuiFormHelperText-root": {
                    fontSize: ".6rem",
                    margin: "0",
                    display: "block",
                    whiteSpace: "normal",
                    width: "12rem",
                    marginLeft: "-7rem",
                    textAlign: "right",
                  },
                }}
              />
            </div>
            <div className="flex justify-between items-center w-full mb-1">
              <span>
                Starting Cash
                <Tooltip
                  title="How much cash you (and bots if applicable) start with. Enter a number 1,000 - 1,000,000."
                  className="mb-0.5 ml-1"
                >
                  <InfoOutline fontSize="small" />
                </Tooltip>
              </span>
              <TextField
                id="starting-cash"
                variant="outlined"
                size="small"
                className="w-28"
                value={startingCash}
                onChange={handleStartingCash}
                type="number"
                error={startingCashError}
                helperText={startingCashMessage}
                disabled={selectedIndex == games.TUTORIAL}
                sx={{
                  "& .MuiFormHelperText-root": {
                    fontSize: ".6rem",
                    margin: "0",
                    display: "block",
                    whiteSpace: "normal",
                    width: "12rem",
                    marginLeft: "-7rem",
                    textAlign: "right",
                  },
                }}
              />
            </div>
            <div className="flex justify-between items-center w-full mb-1">
              <span>
                Volatility
                <Tooltip
                  title="Controls how volatile the stock is. A higher value means the stock is more likely to experience larger price swings. Enter a number 1 - 100."
                  className="mb-0.5 ml-1"
                >
                  <InfoOutline fontSize="small" />
                </Tooltip>
              </span>
              <TextField
                id="volatility"
                variant="outlined"
                size="small"
                className="w-20"
                value={volatility}
                onChange={handleVolatility}
                type="number"
                error={volatilityError}
                helperText={volatilityMessage}
                disabled={selectedIndex == games.TUTORIAL}
                sx={{
                  "& .MuiFormHelperText-root": {
                    fontSize: ".6rem",
                    margin: "0",
                    display: "block",
                    whiteSpace: "normal",
                    width: "12rem",
                    marginLeft: "-7rem",
                    textAlign: "right",
                  },
                }}
              />
            </div>
            <div className="flex justify-between items-center w-full mb-1">
              <span>
                Seed
                <Tooltip
                  title="Seed that controls random events in game and actions performed by bots. Enter any string, or leave blank for a random seed."
                  className="mb-0.5 ml-1"
                >
                  <InfoOutline fontSize="small" />
                </Tooltip>
              </span>
              <TextField
                id="seed"
                variant="outlined"
                size="small"
                className="w-48"
                value={seed}
                onChange={handleSeed}
                disabled={selectedIndex == games.TUTORIAL}
              />
            </div>
            <Button
              variant="contained"
              className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={validateInputs}
            >
              Create
            </Button>
          </>
        ) : (
          <></>
        )}
      </Paper>
    </div>
  );
};

export default CreateGame;
