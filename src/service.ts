/*
import { FastifyInstance, fastify } from 'fastify'

let server: FastifyInstance = fastify()

function ExecuteAsServiceApp() {
  server = fastify()

  server.get('/ping', async (request, reply) => {
    return 'pong\n'
  })

  server.addHook('onReady', function (done: Function) {
    // Some code
    console.log('In onReady ..')
    const err: Error | null = null;
    try {
      setInterval(() => {
        console.log('____ server hook !');
    }, 5000)
  
    } catch (e) {
      console.error('Caught: ' + e)
      console.error(e)
    }
    done(err)
  })

  server.listen({ port: 3000 }, function (err, address) {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    console.log(`Server listening at -  ${address}`)
  })
}

export { ExecuteAsServiceApp }
*/