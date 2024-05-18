import { flags } from "./definition";

flags.define("port", "int", "Port the app listens at", 3000)

flags.define("schedule_updater_delay_sec", "int",
  "Interval (second) for periodic schedule update", 30)  // 30 mins.
