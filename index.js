// --------------------- // بسم الله الرحمن الرحيم // --------------------- //
console.clear();

            require('./src/services/global');
const app = require('express')();

const {readFileSync}    = require('fs');
const http              = require('http');
const https             = require('https');

console.info(
colors.bg.Green,
colors.fg.Crimson,
`            
 ╦ ╦╔═╗╦  ╔═╗ 
 ║ ║╠╣ ║  ║ ║ 
 ╚═╝╚  ╩═╝╚═╝ 
             `,
colors.Reset)

require('express-async-errors');
require('./src/startup/mongodb').mongoDBConnection();
require('./src/startup/routes')(app);

const key               = readFileSync('sslcert/privkey.pem',  'utf8');
const cert              = readFileSync('sslcert/fullchain.pem','utf8');

const httpServer        = http. createServer(app);
const httpsServer       = https.createServer({key,cert},app);

const port              = process.env.PORT  || 80;
const ports             = process.env.PORTs || 443;

httpServer .listen(port ,() => console.log(`${Date().toString()} | HTTP  port ${port} | PID: ${process.pid} | `));
httpsServer.listen(ports,() => console.log(`${Date().toString()} | HTTPs port ${ports} | PID: ${process.pid} | `));


module.exports = server;
