import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("/game", "routes/base_game_solo.tsx"),
    route("/create-game", "routes/create_game.tsx")
] satisfies RouteConfig;
