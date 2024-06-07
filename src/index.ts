import path from 'node:path';
import { StartService } from './service';
import { CreateTaskWorker } from './threads/taskworker';
import './flags/appflags';
import { flags } from './flags/definition';
import WebSocket from 'ws';

import DgramAsPromised, { RemoteInfo, SocketAsPromised } from "dgram-as-promised"

const fileExt = process.env.NODE_ENV === 'production' ? '.js' : '.ts';

const src = path.join(__dirname, `./mediaschedule/schedulemaker${fileExt}`);
const taskWorker = CreateTaskWorker(src);

const service = StartService();

flags.dump();

let counter = 1
const intervalDurationMs = flags.get("schedule_updater_delay_sec") as number * 1000
setInterval(() => {
  taskWorker.dispatchTestMessage('Hola Mundo - ' + counter + ' @ ' + (new Date()).toLocaleTimeString())
  ++counter;
}, intervalDurationMs)

service.listen()

const wsClient = new WebSocket.WebSocket(
      "ws://localhost:3001",
      {perMessageDeflate:false});
console.log("created WS client .....");


wsClient.on('open', () => {
  console.log("🐤 client opened !");

  const enc = new TextEncoder();
  for (let i = 0; i < 4; ++i) {
    const msg = "" + i;  // 🌼-
    const encmsg = enc.encode(msg);
    wsClient.send(encmsg, {binary:true, compress:false});
    console.log(`Sent msg [${msg}], len=${encmsg.length}`);
  }
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

function genRandomName(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let name = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    name += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return name;
}

interface AppMessage {
  code: string,
  timestamp: number,
};

function genRandomMessage(): AppMessage {
  let timestamp = ((new Date()).getTime() / 1000)|0;
  const code = genRandomName(4);
  return {code, timestamp};
}

class DGramClient {
  private readonly destAddress = "127.0.0.1";
  private readonly destPort = 8080;
  private readonly localPort = 8081;

  private readonly socket : SocketAsPromised;

  constructor() {
    this.socket = DgramAsPromised.createSocket("udp4", (msg: Buffer, rinfo: RemoteInfo) => {
      console.log(`Socket connected from ${rinfo.address}, port:${rinfo.port}`);
      const appMsg = JSON.parse(msg.toString("utf8")) as AppMessage;
      console.log(appMsg);
    });
  }

  public async init() {
    const address = await this.socket.bind(this.localPort, "127.0.0.1");
    console.log(`Socket is listening on ${address.address}:${address.port}`);
  }

  public async sendMessage() : Promise<number> {
    const text = JSON.stringify(genRandomMessage());
    const message = Buffer.from(text);
    const bytes = await this.socket.send(message, 0, message.length, this.destPort, this.destAddress);
    return bytes;
  }

  public async testLoopWaited() {
    let totalBytesSent = 0;
    const startTime = performance.now();
    for (let i = 0; i < 500; ++i) {
      totalBytesSent += await this.sendMessage();
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    const endTime = performance.now();
    const elapsedTimeMs = endTime - startTime;
    console.log(`Total bytes sent: ${totalBytesSent}, Elapsed: ${elapsedTimeMs} ms`);
  }
}

global.setTimeout(async () => {
  const sender = new DGramClient();
  console.log("Starting loop ....");
  await sender.testLoopWaited();
}, 2000);