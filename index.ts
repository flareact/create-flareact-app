#!/usr/bin/env node
import packageJson from './package.json';
import Commander from 'commander';

const program = new Commander.Command(packageJson.name)
  .version(packageJson.version)
  .arguments('<project-directory>')
