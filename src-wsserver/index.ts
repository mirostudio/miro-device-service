import { DummyWsServer } from "./dummy-wsserver";

let wserver: DummyWsServer = null;

async function main() {
  wserver = new DummyWsServer();
  await wserver.open();

  global.setInterval(async () => {
    const message = '🌸 🌸 🌸 [from server]: ' + (new Date()).toLocaleTimeString();
    wserver.broadcast(message);
  }, 2 * 1000);
}

process.on('SIGINT', async function() {
  console.log("😱 Interrupted - attempting to shutdown gracefully.");
  if (wserver) {
    await wserver.shutdownAsync();
  }
  process.exit(1);
});

global.setImmediate(() => main());
