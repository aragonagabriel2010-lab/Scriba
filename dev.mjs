import { spawn } from 'node:child_process'

const server = spawn(process.execPath, ['server/index.js'], { stdio: ['inherit', 'pipe', 'inherit'] })
let vite

server.stdout.on('data', (chunk) => {
  process.stdout.write(chunk)
  if (!vite && chunk.toString().includes('in ascolto')) {
    vite = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host'], { stdio: 'inherit' })
  }
})

const stop = () => {
  server.kill()
  vite?.kill()
}
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
