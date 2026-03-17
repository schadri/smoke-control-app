const crypto = require('crypto');

const ecdh = crypto.createECDH('prime256v1');
ecdh.generateKeys();

const publicKey = ecdh.getPublicKey('base64');
const privateKey = ecdh.getPrivateKey('base64');

// VAPID keys need to be URL-safe Base64
function toUrlSafe(base64) {
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

console.log('VAPID_PUBLIC_KEY=' + toUrlSafe(publicKey));
console.log('VAPID_PRIVATE_KEY=' + toUrlSafe(privateKey));
