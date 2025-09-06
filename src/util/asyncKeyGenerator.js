const { generateKeyPair } = require('crypto');

generateKeyPair('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
}, (err, publicKey, privateKey) => {
  if (err) throw err;
  console.log('Public Key:\n', publicKey);
  console.log('Private Key:\n', privateKey);
});