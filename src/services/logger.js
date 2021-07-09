const {join}                    = require('path')
  ,   winston                   = require('winston')
  ,   DailyRotateFile           = require('winston-daily-rotate-file')
  ,   winstonTimestampColorize  = require('winston-timestamp-colorize');


const customLevels = {
    levels: {
        off:        0,
        fatal:      1,
        critical:   2,
        error:      3,
        warning:    4,
        notice:     5,
        info:       6,
        debug:      7,
        access:     8,
    },
    colors: {
        off:        '',
        fatal:      'orange',
        critical:   'orange',
        error:      'bold red',
        warning:    'yellow',
        notice:     'cyan',
        info:       'bold green',
        debug:      'gray',
        access:     'blue',
    }
}

const colorizer  = winston.format.colorize();

// const LEVEL      = Symbol.for('level');
// function filterOnly(level) {
//     return winston.format(function (info) {
//       if (info[LEVEL] === level) return info
//     })();
// }

const loggger = winston.createLogger({
    levels:     customLevels.levels,
    transports: [
        new winston.transports.Console({
            level:  getConfig('logLevelToConsole') || 'access',
            handleExceptions: true,
            format: winston.format.combine(
                winston.format.errors({stack:true}),
                // filterOnly(level),
                winston.format.timestamp({format:'YYYY-MM-DD HH:mm:ss'}),
                winstonTimestampColorize({color: 'gray'}),
                winston.format.printf(msg => {
                    // console.log(Object.keys(msg))
                    // console.log(msg instanceof Object)
                    // msg.meta = msg.meta && msg.meta instanceof Error ? JSON.stringify(msg.meta.stack,null,2) : ''
                    // msg.meta = msg.meta && msg instanceof Error ? msg.meta.stack : ''
                    // msg.meta = msg.meta ? '\ntacktrace => '+msg.meta : ''
                    return colorizer.colorize(msg.level,`${msg.timestamp} [${msg.level}] ${msg.message}. ${msg.stack ? msg.stack : ''}`)
                })
            ),
        }),
        new DailyRotateFile({
            level:          getConfig('logLevelToFile') || 'error',
            filename:       join(__dirname,'..','..','logs',`%DATE%.log`),
            datePattern:    'YYYY-MM-DD',
            zippedArchive:  true,
            maxSize:        '20m',
            maxFiles:       '14d',
            handleExceptions: true,
            format: winston.format.combine(
                winston.format.errors({stack:true}),
                // filterOnly(level),
                winston.format.timestamp({format:'YYYY-MM-DD HH:mm:ss'}),
                winston.format.printf(msg => {
                    // if (msg.message && msg.message instanceof Object) msg.message = JSON.stringify(msg.message,null,2)
                    return `${msg.timestamp} [${msg.level}] ${msg.message}. ${msg.stack ? msg.stack : ''}`
                })
            ),
        })
    ]
});
winston.addColors(customLevels.colors);

module.exports = loggger