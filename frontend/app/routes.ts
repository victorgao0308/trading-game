import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/base-game-solo/:gameId", "routes/BaseGameSolo.tsx"),
  route("/base-game-regular/:gameId", "routes/BaseGameRegular.tsx"),
  route("/create-game", "routes/CreateGame.tsx"),
  route("/game-summary/:gameId", "routes/GameSummary.tsx")
] satisfies RouteConfig;
