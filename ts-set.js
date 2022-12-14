#! /usr/bin/env node

const os = require('os');
const fs = require('fs-extra');
const { execSync } = require('child_process');
const { stdin, stdout, exit } = require('node:process');
const rl = require('node:readline').createInterface(
  { input: stdin, output: stdout, terminal: true }
);
const chalk = require('chalk');
const log = (text, color = 'magenta', style = 'bold') => console.log(chalk[color][style](text) + '\n');

const devDependencies = require('./devDependencies');
const packageJson = require('./packageJson');
const configFilesPath = require('./configFilesPath');

log('šŖ  welcome to ts-set!', 'bgMagenta');

let success;
let projectName;
rl.question(chalk.green("š  what will be the name of your new project? "), (answer) => {
  try {
    projectName = answer.replace(/[^\w-]+/g, '');

    fs.mkdirSync(projectName);
    log(`\nš  created project folder at ./${projectName}`);

    fs.copySync(configFilesPath, projectName);
    fs.writeJSONSync(`${projectName}/package.json`,
      packageJson(projectName), { spaces: 2, EOL: os.EOL });
    log('šļø   added configuration files');

    log('š¦  installing dependencies...');
    execSync(`cd ${projectName} && npm i ${devDependencies.join(' ')}`, { stdio: 'inherit' });

    log('\nšļø   initializing git repository...');
    execSync(`cd ${projectName} && git init && git add . && git commit -m "Initial commit"`, { stdio: 'inherit' });

    success = true;
    rl.close();
  } catch (err) {
    console.error(err);
    rl.close();
  }
})

rl.on('close', () => {
  if (success) {
    log(`\nš  project creation complete!`, 'yellow');
    log(`āØ  run 'cd ${projectName}' to start working.  āØ`, 'cyan');
  } else {
    projectName && fs.removeSync(projectName);
    log('\nš  project creation aborted', 'red');
  }
  exit(0);
});