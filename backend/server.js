import { createApiServer } from './apiServer.js'

const port = Number(process.env.PORT || 8787)
const { server } = createApiServer()

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend API listening on http://localhost:${port}`)
})
