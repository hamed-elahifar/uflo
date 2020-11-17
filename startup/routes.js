const express                   = require('express')
//   ,   RedisStore             = require('rate-limit-redis')
//   ,   rateLimit              = require('express-rate-limit')

  ,   helmet                    = require('helmet')
  ,   compression               = require('compression')
  ,   {mongoDB}                 = require('./mongodb')
  ,   cors                      = require('cors')
  ,   JSONValidation            = require('../middleware/JSONValidation')
  ,   {passport}                = require('../services/passport')

module.exports = function (app) {

    app.disable('x-powered-by');
    app.enable ('trust proxy' );

    app.use(cors());

    app.use(express.urlencoded({extended:true}));
    app.use(express.json({limit:'100kb'}));
    app.use(JSONValidation);
    app.use(express.static('static'));

    if (getConfig('exposeLogsFolder')) app.use('/logs', express.static('logs'));

    app.use(helmet());
    app.use(compression());

    app.use(passport.initialize());

    // const limiter = new rateLimit({
    //   store:  new RedisStore({expiry:10 * 60}),  // 10*60s = 10 min
    //   max:    1000,                              // limit each IP to 100 requests per windowMs
    //   message:
    //           {status:  'error',
    //            code:    '429',
    //            msg:     'Too many requests, try again later'}
    // });

    app.get('/',(req,res,next)=>{
        res.json({status:'ok'})
    })

    app.all('/health',(req,res,next)=>{
        let mongoDbStatus;
        switch(mongoDB.connection.readyState) {
            case 0:
                mongoDbStatus = 'disconnected'
                break;
            case 1:
                mongoDbStatus = 'connected'
                break;
            case 2:
                mongoDbStatus = 'connecting'
                break;
            case 3:
                mongoDbStatus = 'disconnecting'
                break;

            default:
                mongoDbStatus = 'unknown'
        }
        function format(seconds){
            function pad(s){
              return (s < 10 ? '0' : '') + s;
            }
            var hours   = Math.floor(seconds / (60*60));
            var minutes = Math.floor(seconds % (60*60) / 60);
            var seconds = Math.floor(seconds % 60);
          
            return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);
        }
        const uptime = process.uptime();
        const date   = new Date();
        res.status(200).json({
            status:         'ok',
            now:            date.toISOString(),
            uptime:         format(uptime),
            mongoDbStatus,
            version:        '0.3.2',
        });
    });
    
    // if (process.env.NODE_ENV=='production'  || process.env.NODE_ENV == 'azure') app.use(limiter);
    if (process.env.NODE_ENV != 'test') app.use(require('../middleware/httpLogger'))

    app.use('/auth',        require('../routes/auth'))
    app.use('/users',       require('../routes/users'))
    
    app.use('*',            require('../middleware/response'))
    app.use(                require('../middleware/error'))
};