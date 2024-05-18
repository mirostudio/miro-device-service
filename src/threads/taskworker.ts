import path from "node:path";
import { Worker, WorkerOptions } from "worker_threads";

class TaskWorker {
  private worker: Worker

  constructor(worker: Worker) {
    this.worker = worker
  }

  dispatchTestMessage(message: string) : void {
    this.worker.postMessage({
      msg: message
    })
  }
}

function createNodeWorker(workerSourcePath: string) : Worker {
  const workerOptions: WorkerOptions = {
    workerData: {
      childWorkerPath: workerSourcePath,
      initArgs: {
        path: "path_foo_path",
      }
    }
  }
  const workerSrc = path.join(__dirname, './worker.cjs')
  const worker = new Worker(workerSrc, workerOptions);
  for (const evtType of ['message', 'error', 'online', 'exit']) {
    worker.on(evtType, (arg) => {
      console.log(`Message type=${evtType} ....`)
      console.log(arg)
    })
  }
  return worker
}

function CreateTaskWorker(srcPath: string) {
  const worker = createNodeWorker(srcPath)
  return new TaskWorker(worker)
}

export { CreateTaskWorker }