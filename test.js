const spawnSync = require('./index')

const out = spawnSync('lss', ['-lh'])

console.log('expect error', out)

const out2 = spawnSync('ls', ['-lh'])

console.log('expect success', out2)