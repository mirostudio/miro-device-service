import { workerData, parentPort, threadId } from 'worker_threads';

console.log(`Init worker code : ${parentPort}`)

interface AppWorkerPayload {
  msg: string
}

if (parentPort === null) {
  throw new Error('parentPort is null')
}
console.log(workerData)
parentPort.on('message', (payload: AppWorkerPayload) => {
  console.log(payload)
});