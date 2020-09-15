#!/usr/bin/env node

import commander from 'commander';
import loadPage from '../src/index.js';
import log from '../src/utils.js';

const program = new commander.Command();
const filepath = process.cwd();

program
  .version('0.0.1')
  .description('Pages loader. Enter path to source. ')
  .option('-o, --output [type]', 'Output format', filepath)
  .arguments('<source>')
  .action((source, { output }) => (
    loadPage(source, output)
      .then(() => log('%o', 'Successfully loaded'))
      .catch((error) => {
        console.error(error);
        process.exit(1);
      })
  ))
  .parse(process.argv);
