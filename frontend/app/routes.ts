import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/game/:gameId", "routes/BaseGame.tsx"),
  route("/create-game", "routes/CreateGame.tsx")
] satisfies RouteConfig;
