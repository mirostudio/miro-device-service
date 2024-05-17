import path from 'path';
import { ThreadPool } from './threads/threadpool';

const fileExt = process.env.NODE_ENV === 'production' ? '.js' : '.ts';

const pool = new ThreadPool()
const src = path.join(__dirname, `./appworker${fileExt}`)
pool.startWorkerThread(src)

let counter = 1

setInterval(() => {
  pool.dispatchTestMessage('Hola Mundo - ' + counter)
  ++counter;
}, 2000)
