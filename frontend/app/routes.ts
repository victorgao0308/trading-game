import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/game/:gameId", "routes/BaseGameSolo.tsx"),
  route("/create-game", "routes/CreateGame.tsx")
] satisfies RouteConfig;
