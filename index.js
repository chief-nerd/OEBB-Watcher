#!/usr/bin/env node
const {Command} = require('commander');
const packageJSON = require('./package.json');

const monitorTrain = require("./monitorTrain");

const program = new Command();
program.version(packageJSON.version, '-v, --version');

program
	.command('monitor [train]', {isDefault: true})
	.option("-i, --interval <time_in_seconds>", "Update Interval in seconds")
	.description('Monitor an ÖBB train')
	.action(monitorTrain);

program.parse(process.argv);
