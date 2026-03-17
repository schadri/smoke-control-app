const webpush = require('web-push');
const fs = require('fs');
const vapidKeys = webpush.generateVAPIDKeys();
const content = `VAPID_PUBLIC_KEY=${vapidKeys.publicKey}\nVAPID_PRIVATE_KEY=${vapidKeys.privateKey}\n`;
fs.writeFileSync('vapid-keys.txt', content);
console.log('Keys generated in vapid-keys.txt');
