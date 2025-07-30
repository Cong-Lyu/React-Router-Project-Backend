const crypto = require('crypto');

function tokenGenerator(length) {
  return crypto.randomBytes(length).toString('hex'); 
}

module.exports = tokenGenerator