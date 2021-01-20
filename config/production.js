console.log('Production config loaded...')

module.exports = {
    "PORT":                     3000,
    "welcomeMessage":           "uflo [DEV] running on port",
    "mongoDB":{
        "connectionString":     "mongodb://localhost/uflo",
        "debug":                false,
        "onSuccess":            "Connected to mongoDB server",
        "onError":              "Could NOT connect to mongoDB server"
    },
    "DB":{
        "connectionString":     "postgres://postgres:jh23y6ni4jk4un7vLM89YN@127.0.0.1:5432/uflo",
        "onSuccess":            "Connected to Postgres [uFlo] server",
        "onError":              "Unable to connect to Postgres [uFlo] server",
        "debug":                 false,
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
        "successRedirect":          'http://api.uflo.io:3000',
        "failureRedirect":          'http://api.uflo.io:3000',
    },
    "exposeLogsFolder":             true,
    "logLevelToConsole":            "access",
    "logLevelToFile":               "access",
    "logLevelToDB":                 "error",
    "debug":                        true,
    "clientURLs":                   ['http://api.uflo.io:3000','http://localhost:3000','http://127.0.0.1:3000'],
}
