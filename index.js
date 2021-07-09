// --------------------- // بسم الله الرحمن الرحيم // --------------------- //
console.clear();

            require('./src/services/global');
const app = require('express')();

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


const port   = process.env.PORT || getConfig('PORT') || 3000;
const server = app.listen(port,() => {
    logger.info(`uFlo Starts On Port ${port}`)
})

module.exports = server;
