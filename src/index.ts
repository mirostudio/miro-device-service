import path from 'node:path';
import { StartService } from './service';
import { CreateTaskWorker } from './threads/taskworker';
import './flags/appflags';
import { flags } from './flags/definition';

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

console.log('Before listen ..')

service.listen()

console.log('After listen ..')
