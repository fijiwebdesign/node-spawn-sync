# Node require("child_process").spawnSync replacement

Running nodejs on deno@1.22.3 does not include `child_process.spawnSync` in it's nodejs polyfills. 

This is an emulation of `spawnSync` with `fs` and `child_process.sync`. 

[Edit on StackBlitz ⚡️](https://stackblitz.com/edit/node-s9w6o9)