const { array } = require('@hapi/joi');

// --------------------- // بسم الله الرحمن الرحيم // --------------------- //
console.clear();

            require('./services/global');
const app = require('express')();

console.info(
colors.bg.Green,
colors.fg.Crimson,
`            
 ╦ ╦╔═╗╦  ╔═╗ 
 ║ ║╠╣ ║  ║ ║ 
 ╚═╝╚  ╩═╝╚═╝ 
             `,
colors.Reset
)

require('express-async-errors');
require('./startup/mongodb').mongoDBConnection();
require('./startup/routes')(app);


const port   = process.env.PORT || getConfig('PORT') || 3000;
const server = app.listen(port,() => {
    console.info('uFlo Starts On Port 3000')
})

module.exports = server;