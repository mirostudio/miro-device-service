import path from 'path';
import { StartService } from './service';
import { CreateTaskWorker } from './threads/taskworker';

const fileExt = process.env.NODE_ENV === 'production' ? '.js' : '.ts';

const src = path.join(__dirname, `./mediaschedule/schedulemaker${fileExt}`)
const taskWorker = CreateTaskWorker(src)

const service = StartService()

let counter = 1
setInterval(() => {
  taskWorker.dispatchTestMessage('Hola Mundo - ' + counter + ' @ ' + (new Date()).toLocaleTimeString())
  ++counter;
}, 2000)

console.log('Before listen ..')

service.listen()

console.log('After listen ..')
