import { FastifyError, FastifyInstance, fastify } from 'fastify'
import { createError } from '@fastify/error'

const OnReadyError = createError('ON_READY_FAIL', 'Error in onReady')

function StartService() {
  const service: FastifyInstance = fastify()

  service.addHook('onReady', function (done: (err?: FastifyError) => void) {
    try {
      serviceOnReady();
      done()
    } catch (e) {
      done(new OnReadyError())
    }
  })

  const listenLoop = () => {
    service.listen({ port: 3000 }, function (err, address) {
      if (err) {
        console.error(err)
        process.exit(1)
      }
      console.log(`Server listening at -  ${address}`)
    })
  }

  return {
    service,
    listen() { listenLoop() },
  }
}

function serviceOnReady() {
  setInterval(() => {
      console.log('____ server hook !');
  }, 25000)
}

export { StartService }
