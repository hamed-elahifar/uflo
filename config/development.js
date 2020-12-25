console.log('Development config loaded...')

module.exports = {
    "PORT":                     3000,
    "welcomeMessage":           "uflo [DEV] running on port",
    "mongoDB":{
        // "connectionString":     "mongodb://localhost/uflo",
        "connectionString":     "mongodb+srv://uflo:uflo@uflo.4pl82.mongodb.net/uflo?retryWrites=true&w=majority",
        "debug":                false,
        "onSuccess":            "Connected to mongoDB server",
        "onError":              "Could NOT connect to mongoDB server"
    },
    "jwt":{
        "token":                "oyN^76n(*&N&I3N76r",
        "tokenTime":            6048000  // 7 days
    },
    "redis":{
        "env":                  "local",
        "port":                 6379,
        "db":                   1,
        "url":                  "127.0.0.1",
        "cacheKey":             "",
        "redisExpire":          600,
        "onSuccess":            "Connected to LOCAL Redis server",
        "onError":              "Could NOT connect to LOCAL Redis server"
    },
    "nodemailer":{
        "transport":{
            "host":     "",
            "port":     587,
            "secure":   false, // true for 465, false for other ports
            "auth": {
                "user": "",
                "pass": ""
            }
        }
    },
    "google":{
        "clientID":                 '859508223645-cbbn56jvt5tmrkohlfdlfna5bklbnnkm.apps.googleusercontent.com',
        "clientSecret":             '4wELHtwGm2Ybr6PEKSXYteCN',
        "callbackURL":              'http://localhost:3000/auth/google/callback',
        "successRedirect":          'http://localhost:3000/',
        "failureRedirect":          'http://localhost:3000/',
    },
    "exposeLogsFolder":             true,
    "logLevelToConsole":            "access",
    "logLevelToFile":               "access",
    "logLevelToDB":                 "error",
    "debug":                        true,
    'clientURLs':                   ['http://localhost:3000/','http://127.0.0.1:3000/']
}
