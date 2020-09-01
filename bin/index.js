#!/usr/bin/env node
import commander from 'commander';
import printValue from '../src/index.js';

const program = new commander.Command();
const defaultFileToSave = process.cwd();

program
  .version('0.0.1')
  .description('Pages loader. Enter path to source. ')
  .option('-o, --output [type]', 'Output format', defaultFileToSave)
  .arguments('<source>')
  .action((source, { output }) => (
    console.log(printValue(source, output))
  ))
  .parse(process.argv);

if (!program.args.length) {
  program.help();
}
