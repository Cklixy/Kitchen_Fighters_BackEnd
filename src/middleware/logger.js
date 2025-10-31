const morgan = require('morgan');

// Export a configured morgan middleware instance
const logger = morgan('dev');

module.exports = { logger };
