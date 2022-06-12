const cp = require('child_process');
const fs = require('fs');

function createRet() {
  const ret = {
    pid: 0,
    get output() {
      return [ret.stdout, ret.stderr]
    },
    stdout: Buffer.from([]),
    stderr: Buffer.from([]),
    status: null,
    signal: null,
    error: null,
  };
  return ret
}

function addBuffer(buffer, chunk) {
  if (chunk instanceof Buffer) {
    console.log('addbuffer', { buffer, chunk, str: chunk.toString() })
    return Buffer.concat([buffer, chunk]);
  } else {
    return buffer + chunk
  }
}

/**
 * spawnSync() 
 *  Implements child_process.spawnSync() using a shell script which pipes stdout/stderr to a named pipe
 *  Reading from this pipe with fs.readFileSync blocks the main event loop (without cpu usage) causing the sync behaviour
 * 
 * @todo handle signals
 * 
 * @param {string} command 
 * @param {string[]} args 
 * @param {{ [key:string]: string }} options 
 * @returns { pid: Number, output: Buffer[], stdout: Buffer, stderr: Buffer, status: number, signal: string, error: Error|null }
 */
module.exports = function spawnSync(command, args = [], options) {
  
  const ret = createRet();

  const child = cp.spawn('sh', ['./spawnSync.sh', command, ...args], options);
  ret.pid = child.pid
  child.stdout.on('data', (data) => (ret.stdout = addBuffer(ret.stdout, data)));
  child.stderr.on('data', (data) => (ret.stderr = addBuffer(ret.stderr, data)));
  child.on('close', (code) => ret.code = code);
  child.on('error', (err) => ret.error = err);

  const exitCodePath = '/tmp/process-pipe-code-' + child.pid
  const outPath = '/tmp/process-pipe-out-' + child.pid

  const date = Date.now()
  const timeout = 1000 // 1sec
  while(!fs.existsSync(exitCodePath)) {
    if (date + timeout <= Date.now()) throw new Error('Timeout')
  }
  ret.status = Number(fs.readFileSync(exitCodePath)); // pauses main process
  fs.unlinkSync(exitCodePath)

  while(!fs.existsSync(outPath)) {
    if (date + timeout <= Date.now()) throw new Error('Timeout')
  }

  const out = fs.readFileSync(outPath)
  fs.unlinkSync(outPath)

  if (ret.status !== 0) {
    ret.error = new Error(out.toString())
    ret.stderr = out
  } else {
    ret.stdout = out
  }

  return ret;
}
