const { workerData, parentPort } = require('worker_threads');
const { TaskRunner } = require('./taskrunner');

if (parentPort === null) {
  throw new Error('parentPort is null')
}

const {childWorkerPath, initArgs} = workerData;

if (childWorkerPath.endsWith('.ts')) {
  require('ts-node').register();
}
const {default:WorkerClaz} = require(childWorkerPath);

const appWorker = new WorkerClaz(initArgs)
if (!(appWorker instanceof TaskRunner)) {
  throw new Error('worker not instanceof TaskRunner')
}

parentPort.on('message', (payload) => {
  appWorker.run(payload)
});
