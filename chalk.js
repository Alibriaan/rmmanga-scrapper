const chalk = require('chalk');

module.exports.log = console.log;
module.exports.info = chalk.bold.blue;
module.exports.success = chalk.bold.success;
module.exports.warn = chalk.bold.orange;
module.exports.error = chalk.bold.red;
