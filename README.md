# Node require("child_process").spawnSync replacement

Running nodejs on deno@1.22.3 does not include `child_process.spawnSync` in it's nodejs polyfills. 

This is an emulation of `spawnSync` with `fs.readFileSync` and `child_process.spawn`. 

We create a named pipe that we `readFileSync(pipe)` from the main event loop. This blocks the event loop without adding cpu processing. Thus emulating `spawnSync()` 

[Edit on StackBlitz ⚡️](https://stackblitz.com/edit/node-s9w6o9)