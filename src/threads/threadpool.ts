import path from "path";
import { Worker, WorkerOptions } from "worker_threads";

class ThreadPool {
  private readonly threads: Array<Worker>;
  constructor() {
    this.threads = [];
  }

  startWorkerThread(appWorkerPath: string) : void {
    const workerOptions: WorkerOptions = {
      workerData: {
        childWorkerPath: appWorkerPath,
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
    this.threads.push(worker)
    /*
    worker.on('message', (result) => {
      // In case of success: Call the callback that was passed to `runTask`,
      // remove the `TaskInfo` associated with the Worker, and mark it as free
      // again.
      worker[kTaskInfo].done(null, result);
      worker[kTaskInfo] = null;
      this.freeWorkers.push(worker);
      this.emit(kWorkerFreedEvent);
    });
   */
  }

  dispatchTestMessage(message: string) : void {
    for (const worker of this.threads) {
      worker.postMessage({
        msg: message
      })
    }
  }
}

export { ThreadPool }