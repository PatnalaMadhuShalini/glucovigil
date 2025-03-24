const fs = require('fs');
const { spawn } = require('child_process');

const child = spawn('npm', ['run', 'db:push'], {
  stdio: ['pipe', 'inherit', 'inherit']
});

setTimeout(() => {
  child.stdin.write('\n'); // Press Enter to select the default option
}, 5000);

child.on('close', (code) => {
  console.log();
});
