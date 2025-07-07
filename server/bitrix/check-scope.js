const https = require('https');
const webhookUrl = 'https://hartzell.app/rest/1/jp689g5yfvre9pvd/';

// Check webhook scope
const url = new URL(webhookUrl);
const path = `${url.pathname}scope.json`;

https.get(`https://${url.hostname}${path}`, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const result = JSON.parse(data);
    console.log('Webhook Scopes:', result.result);
  });
});