import { useEffect, useRef, useState } from "react";

import { Button, Checkbox, Paper } from "@mui/material";
import {
  ArrowBack,
  ArrowForward,
  InfoOutline,
  Close,
} from "@mui/icons-material";
import {
  Divider,
  TextField,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";

const gameModes = ["Base Game (Solo)", "Base Game (Regular)"];
const descriptions = [
  "Base game with no bots. Stock prices are derived from historical stock prices, random in-game events, and your actions. You are able to directly buy/sell stock at the listed price.",
  "Base game where you trade against bots. Stock prices are derived from historical stock prices, random in-game events, and current supply/demand. You are able to create various types of buy/sell orders, and trades are only executed when orders can be fulfilled.",
  "c",
];

import axios from "axios";

import web_url from "web-url";

const CreateGame = () => {
  const games = Object.freeze({
    BASE_GAME_SOLO: 0,
    BASE_GAME_REGULAR: 1,
  });

  const navigate = useNavigate();

  // whether the menu has been loaded and configured
  const [isLoaded, setIsLoaded] = useState(false);

  // selected index for game mode
  const [selectedIndex, setSelectedIndex] = useState<number>(
    games.BASE_GAME_SOLO
  );

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

  const [numTradingDays, setNumTradingDays] = useState("10");
  const [numTradingDaysError, setNumTradingDaysError] = useState(false);
  const [numTradingDaysMessage, setNumTradingDaysMessage] = useState("");

  const [numTicksPerDay, setNumTicksPerDay] = useState("20");
  const [numTicksPerDayError, setNumTicksPerDayError] = useState(false);
  const [numTicksPerDayMessage, setNumTicksPerDayMessage] = useState("");

  const [timeBetweenTicks, setTimeBetweenTicks] = useState("1.5");
  const [timeBetweenTicksError, setTimeBetweenTicksError] = useState(false);
  const [timeBetweenTicksMessage, setTimeBetweenTicksMessage] = useState("");

  const [startingCash, setStartingCash] = useState("1000");
  const [startingCashError, setStartingCashError] = useState(false);
  const [startingCashMessage, setStartingCashMessage] = useState("");

  const [volatility, setVolatility] = useState("10");
  const [volatilityError, setVolatilityError] = useState(false);
  const [volatilityMessage, setVolatilityMessage] = useState("");

  const [isTutorial, setIsTutorial] = useState(false);

  const [isDeletingGame, setIsDeletingGame] = useState(false);

  // indicates whether a game already exists or not
  const [existingGame, setExistingGame] = useState(false);

  const gameSetup = useRef<any>({});

  const [seed, setSeed] = useState("");

  // holds previous game object
  const [prevGame, setPrevGame] = useState<any>({
    stock: { type: "", id: "", ticks_generated: 0, current_price: 0 },
  });

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

  const handleCloseDialog = () => {
    setExistingGame(false);
  };

  // set game parameters
  useEffect(() => {
    if (selectedIndex == games.BASE_GAME_SOLO) {
      setNumTradingDays("10");
      setNumTicksPerDay("20");
      setTimeBetweenTicks("1.5");
      setStartingCash("1000");
      setVolatility("10");
      setSeed("");
      setIsLoaded(true);
    } else if (selectedIndex == games.BASE_GAME_REGULAR) {
      setNumBots("30");
      setNumMM("3");
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

  const handleTutorial = () => {
    setIsTutorial((prev) => !prev);
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
    if (isNaN(val) || val < 1 || val > 20) {
      setNumTradingDaysError(true);
      setNumTradingDaysMessage("Enter an integer 1 - 20");
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
    if (isNaN(val) || val < 1 || val > 100) {
      setNumTicksPerDayError(true);
      setNumTicksPerDayMessage("Enter an integer 1 - 100");
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
    if (isNaN(val) || val < 0.5 || val > 5) {
      setTimeBetweenTicksError(true);
      setTimeBetweenTicksMessage("Enter a value 0.5 - 5");
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

    gameSetup.current = {
      gameType: selectedIndex,
      numTradingDays,
      numTicksPerDay,
      timeBetweenTicks,
      startingCash,
      volatility,
      seed,
      isTutorial,
    };

    if (selectedIndex == games.BASE_GAME_REGULAR) {
      gameSetup.current.numBots = numBots;
      gameSetup.current.numMM = numMM;
    }

    // try to load in a previous game, if one exists
    const getPrevGame = async () => {
      const prevGameId = localStorage.getItem("gameId") || "";
      const response = await axios.get(`${web_url}/get-game-manager/`);

      const prevGame = response.data.game_manager[prevGameId];

      if (prevGame) {
        setExistingGame(true);
        setPrevGame(prevGame);
      } else {
        localStorage.setItem("gameSetup", JSON.stringify(gameSetup.current));

        await createNewGame();
      }
    };
    getPrevGame();
  };

  // load in previous game
  // differentiate between different game types?
  const loadPrevGame = () => {
    navigate(`/game/${localStorage.getItem("gameId")}`);
  };

  // delete old game from game manager
  const deleteOldGame = async () => {
    setIsDeletingGame(true);
    const response = await axios.delete(
      `${web_url}/remove-game-from-manager/${localStorage.getItem("gameId")}`
    );

    localStorage.setItem("gameSetup", JSON.stringify(gameSetup.current));
    await createNewGame();
  };

  // creates a new game, registers it, and navigates to the new page
  const createNewGame = async () => {
    const createResponse = await axios.post(`${web_url}/create-base-game/`, {
      seed: seed,
      total_ticks: parseInt(numTicksPerDay) * parseInt(numTradingDays),
    });
    const gameId = createResponse.data.base_game.id;
    localStorage.setItem("gameId", gameId);
    const registerReponse = await axios.post(
      `${web_url}/register-base-game/${gameId}/`
    );
    setIsDeletingGame(false);

    navigate(`/game/${gameId}`);
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
                    disabled={isTutorial}
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
                    disabled={isTutorial}
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
                  title="Number of trading days in the game. The game ends after the specified number of trading days. Enter an integer 1 - 20."
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
                disabled={isTutorial}
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
                  title="Number ticks per trading day. A tick is an update in stock price. Enter an integer 1 - 100."
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
                disabled={isTutorial}
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
                  title="Time (in seconds) between each stock tick. Enter a number 0.5 - 5."
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
                disabled={isTutorial}
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
                disabled={isTutorial}
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
                disabled={isTutorial}
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
                disabled={isTutorial}
              />
            </div>

            <div className="flex justify-between items-center w-full mb-1">
              <span>
                Tutorial Mode
                <Tooltip
                  title="Toggles tutorial mode, where you can learn how to play the game."
                  className="mb-0.5 ml-1"
                >
                  <InfoOutline fontSize="small" />
                </Tooltip>
              </span>
              <Checkbox
                id="tutorial"
                size="small"
                checked={isTutorial}
                onChange={handleTutorial}
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

      {/* Previous game has been found */}
      <Dialog
        open={existingGame}
        onClose={handleCloseDialog}
        disableEnforceFocus
      >
        <div className="relative">
          <button
            onClick={(e) => {
              e.currentTarget.blur();
              handleCloseDialog();
            }}
            aria-label="Close dialog"
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            <Close />
          </button>
          <DialogTitle>Previous Game Found</DialogTitle>
          <DialogContent>
            A previous game has been found: <br />
            <Divider
              className="w-full font-bold !my-2"
              variant="fullWidth"
            ></Divider>
            Type: {prevGame.type} <br />
            ID: {prevGame.id} <br />
            Ticks Generated: {prevGame.stock.ticks_generated} <br />
            Current Stock Price: ${prevGame.stock.current_price.toFixed(2)}{" "}
            <br />
            Player Total Assets: 0 (TO DO) <br />
            <Divider
              className="w-full font-bold !my-2"
              variant="fullWidth"
            ></Divider>
            Load the preivous game, or create a new one?
          </DialogContent>

          {isDeletingGame ? (
            <div className="w-full h-12 flex justify-center">
              <CircularProgress size={32} />
            </div>
          ) : (
            <DialogActions>
              <Button onClick={loadPrevGame}>Load Previous Game</Button>
              <Button onClick={deleteOldGame}>Create New Game</Button>
            </DialogActions>
          )}
        </div>
      </Dialog>
    </div>
  );
};

export default CreateGame;
