import { useState } from "react";
import { Modal, Box, Button } from "@mui/material";



const BaseGameSoloDescriptionModal = () => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <Button color="primary" onClick={handleOpen}>
        How To Play
      </Button>

      <Modal open={open} onClose={handleClose}>
        <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-md shadow-lg p-6 w-full max-w-1/2 max-h-1/2 overflow-y-auto">
          <h1 className="text-xl font-bold mb-4">How To Play</h1>
          In the solo version of the base game, your goal is to make as much money as possible by trading stocks. 
          Upon loading into the game, you will see a line chart showing the prices of a particular stock. 
          To help you out, 10 initial price values are shown by default.
          The game starts out paused, and when the game is paused, you can hover over the data points in the line graph to see the exact price
          of a stock during a given time.
          <div className="mb-6"/>
          When you start data generation (by clicking the Start Data Generation button), you will have access to the stock broker. By default, the broker
          starts off in "Buy" mode. In buy mode, you can start typing a number, and you will see that number appear in green text
          overlaid across the screen. This number represents a buy order, and when you submit an order, you are saying that you
          want to purchase that amount of stock. To submit an order, simply type in the amount of stock you want to buy and hit
          the enter button. You will then see the order you just submitted appear in the Orders Made section in the top right of the screen.
          You can also switch the broker to buy mode at any time by pressing "b" or "+".
          <div className="mb-6"/>
          The broker also has a sell mode, which works the same way as buy mode except you are placing an order to sell stocks instead
          of buying them.
        </Box>
      </Modal>
    </div>
  );
};

export default BaseGameSoloDescriptionModal;
