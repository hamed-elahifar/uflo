
global._            = require('lodash');
global.environment  = process.env.NODE_ENV ? process.env.NODE_ENV : 'production'
global.getConfig    = require('../../config/index')
global.logger       = require('./logger')

const Events        = require('events');
global.event        = new Events.EventEmitter();

global.sleep        = (ms) => new Promise(resolve => setTimeout(resolve, ms))

global.tojs         = (promise) => {
    if (!promise instanceof Promise) throw new Error('This Object Is Not A Promis Instance...')

    return promise
        .then(data => [null,data])
        .catch(err => [err ,null]);
}
global.colors = {
    Reset:          "\x1b[0m",
    Bright:         "\x1b[1m",
    Dim:            "\x1b[2m",
    Underscore:     "\x1b[4m",
    Blink:          "\x1b[5m",
    Reverse:        "\x1b[7m",
    Hidden:         "\x1b[8m",
    fg: {
        Black:      "\x1b[30m",
        Red:        "\x1b[31m",
        Green:      "\x1b[32m",
        Yellow:     "\x1b[33m",
        Blue:       "\x1b[34m",
        Magenta:    "\x1b[35m",
        Cyan:       "\x1b[36m",
        White:      "\x1b[37m",
        Crimson:    "\x1b[38m",
    },
    bg: {
        Black:      "\x1b[40m",
        Red:        "\x1b[41m",
        Green:      "\x1b[42m",
        Yellow:     "\x1b[43m",
        Blue:       "\x1b[44m",
        Magenta:    "\x1b[45m",
        Cyan:       "\x1b[46m",
        White:      "\x1b[47m",
        Crimson:    "\x1b[48m",
    }
};
process.on("uncaughtException" , ex => {
    if (JSON.stringify(ex,null,2) == '{}') {
        console.error(colors.fg.Red,colors.Blink,'uncaughtException => ',colors.Reset)
        errorLog(ex)
        return
    } 

    logger.error('uncaughtException ', ex.message || 
        ex instanceof Object ? JSON.stringify(ex,null,2) : ex)
    logger.debug(ex.stack || 
        ex instanceof Object ? JSON.stringify(ex,null,2) : ex)
})

process.on("unhandledRejection", ex => {
    if (JSON.stringify(ex,null,2) == '{}') {
        console.error(colors.fg.Red,colors.Blink,'unhandledRejection => ',colors.Reset)
        errorLog(ex)
        return
    }

    logger.error('unhandledRejection ',ex.message || 
        ex instanceof Object ? JSON.stringify(ex,null,2) : ex)
    logger.debug(ex.stack || 
        ex instanceof Object ? JSON.stringify(ex,null,2) : ex)
})


if (!Array.prototype.hasOwnProperty('isEmpty')) {
    Object.defineProperty(Array.prototype,'isEmpty', {
        get() {
            return !!this.length
        }
    });
}

if (!Array.prototype.hasOwnProperty('last')) {
    Object.defineProperty(Array.prototype,'last', {
        get() {
            return this[this.length - 1];
        }
    });
}

global.errorLog = (msg,err) => {

    // console.log('msg',msg)
    // console.log('err',err)

    if (!msg && !err) return

    if (typeof msg == 'string') {
        logger.error(msg)

        logger.debug(new Error().stack)

        return;
    }

    if (msg instanceof Error) {
        msg.message ? logger.error(msg.message) : logger.error(msg)
        msg.stack   ? logger.debug(msg.stack)   : null
    }

    if (err instanceof Error) {
        err.message ? logger.error(err.message) : logger.error(err)
        err.stack   ? logger.debug(err.stack)   : null
    }
    
    if ((msg instanceof Object) && !(msg instanceof Error)) {
        logger.error(JSON.stringify(msg,null,2))
    }
    if ((err instanceof Object) && !(err instanceof Error)) {
        
        logger.error(JSON.stringify(err,null,2))
    }

}

process.on('SIGTERM', ()=>{console.log('SIGTERM received');process.exit();});
process.on('SIGINT' , ()=>{console.log('SIGINT  received');process.exit();});
