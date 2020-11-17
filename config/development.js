console.log('Development config loaded...')

module.exports = {
    "PORT":                     3000,
    "welcomeMessage":           "uflo [DEV] running on port",
    "mongoDB":{
        "connectionString":     "mongodb://localhost/uflo",
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
        "clientID":                 '921834319384-jngst934g85p8s34br53q9r67s5revge.apps.googleusercontent.com',
        "clientSecret":             'tzWDwBWdK3_XMo30vF-8Mt4w',
        "callbackURL":              'http://api.uflo.io:3000/auth/google/callback',
    },
    "exposeLogsFolder":             true,
    "logLevelToConsole":            "access",
    "logLevelToFile":               "access",
    "logLevelToDB":                 "error",
    "debug":                        true,
}