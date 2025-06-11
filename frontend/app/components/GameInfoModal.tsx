import React, { useState } from "react";
import { Modal, Box, CircularProgress, Button } from "@mui/material";
import type { Player } from "../routes/BaseGameSolo";

type GameInfoModalProps = {
  gameId: string;
  stockId: string;
  players: Player[];
};

const GameInfoModal: React.FC<GameInfoModalProps> = ({
  gameId,
  stockId,
  players,
}) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <Button color="primary" onClick={handleOpen}>
        View Game Info
      </Button>

      <Modal open={open} onClose={handleClose}>
        <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-md shadow-lg p-6 w-full max-w-1/2 max-h-1/2 overflow-y-auto">
          <h1 className="text-xl font-bold mb-4">Game Info</h1>
          <h1>
            Game ID: {gameId !== "" ? gameId : <CircularProgress size={20} />}
          </h1>

          <h1>
            Stock ID:{" "}
            {stockId !== "" ? stockId : <CircularProgress size={20} />}
          </h1>

          <h1>Players</h1>

          {players.map((player) => (
            <div key={player.id}>
              ID: {player.id}, Role: {player.role}
            </div>
          ))}
        </Box>
      </Modal>
    </div>
  );
};

export default GameInfoModal;
