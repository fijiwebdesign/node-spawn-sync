// run `node index.js` in the terminal

const cp = require('child_process');
const fs = require('fs');

function createRet(process) {
  return {
    pid: process.pid,
    output: [],
    stdout: [],
    stderr: [],
    status: null,
    signal: null,
    error: null,
  };
}

function createBuffers(ret) {
  if (ret.stdout[0] instanceof Buffer) {
    ret.stdout = Buffer.concat(ret.stdout);
  } else {
    ret.stdout = ret.stdout.join('');
  }
  if (ret.stderr[0] instanceof Buffer) {
    ret.stderr = Buffer.concat(ret.stderr);
  } else {
    ret.stderr = ret.stderr.join('');
  }
}

function spawnSync(command, args, options) {
  const child = cp.spawn(command, args, options);
  const ret = createRet(child);
  child.stdout.on('data', (data) => ret.stdout.push(data));
  child.stderr.on('data', (data) => ret.stderr.push(data));

  console.log('child', child.pid);

  // wait for child process to exit

  const uid = Math.random().toString(36).slice(2);
  const pipePath = '/tmp/spawn-' + uid + '-' + child.pid;
  console.log('creating pipe', pipePath);
  const pipe = cp.spawn('mkfifo ' + pipePath, args, options);
  pipe.on('close', () => {
    child.on('close', (code) => {
      ret.status = code;
      createBuffers(ret);
      fs.writeFileSync(pipePath, 'done\n');
    });
    child.on('error', (err) => {
      ret.error = err;
      createBuffers(ret);
    });
  });
  console.log('read file', pipePath);
  fs.readFileSync(pipePath); // pauses main process until read completes

  return ret;
}

console.log('stdout', spawnSync('ls').stdout);
