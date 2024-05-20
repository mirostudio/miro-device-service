import path from 'node:path';
import { StartService } from './service';
import { CreateTaskWorker } from './threads/taskworker';
import './flags/appflags';
import { flags } from './flags/definition';
import WebSocket from 'ws';

const fileExt = process.env.NODE_ENV === 'production' ? '.js' : '.ts';

const src = path.join(__dirname, `./mediaschedule/schedulemaker${fileExt}`)
const taskWorker = CreateTaskWorker(src)

const service = StartService()

flags.dump()

let counter = 1
const intervalDurationMs = flags.get("schedule_updater_delay_sec") as number * 1000
setInterval(() => {
  taskWorker.dispatchTestMessage('Hola Mundo - ' + counter + ' @ ' + (new Date()).toLocaleTimeString())
  ++counter;
}, intervalDurationMs)

service.listen()

const wsClient = new WebSocket.WebSocket("ws://localhost:3001");
console.log("created wsServer .....");
wsClient.on('open', () => {
  console.log("🐤 client opened !");
  wsClient.send("🌼 🌼 🌼 Client's test msg 1");
  wsClient.send("🌼 🌼 🌼 Client's test msg 2");
  wsClient.send("🌼 🌼 🌼 Client's test msg 3");
});
wsClient.on("close", (code: number) => {
  console.error("Closed , code: " + code);
});
wsClient.on("error", (error: Error) => {
  console.error(error);
});
wsClient.on("message", (data: WebSocket.RawData) => {
  const message = data.toString('utf8');
  console.log(message);
});
wsClient.on("pong", (_data: Buffer) => {
  console.error("Pong from server ..");
});