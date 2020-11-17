const passport          = require('passport')
const LocalStrategy     = require('passport-local').Strategy

const JwtStrategy       = require('passport-jwt').Strategy
const ExtractJwt        = require('passport-jwt').ExtractJwt
const GoogleStrategy    = require( 'passport-google-oauth2' ).Strategy;


const {User}        = require('../models/users')

passport.use(new LocalStrategy(
    function(username, password, done) {
        User.findOne({ username: username }, function (err, user) {
            if (err) { return done(err,false); }
            // if (!user) {
            //     return done(null,false,{message:'Incorrect username/password.'});
            // }
            if (!user || !user.validatePassword(password)) {
                return done(null,false,{message:'Incorrect username or password'});
            }
            return done(null,user);
        });
    }
))


var options = {
    jwtFromRequest:         ExtractJwt.fromExtractors([

                            ExtractJwt.fromHeader('token'),
                            ExtractJwt.fromBodyField('token'),
    ]),
    secretOrKey:            getConfig('jwt.token'),
    // issuer:                 'accounts.examplesoft.com',
    // audience:               'yoursite.net',
    // algorithms:             ['RS256'],
    // ignoreExpiration:       false,
    // passReqToCallback:      false,
    jsonWebTokenOptions:{

        complete:           false,
        clockTolerance:     '',
        maxAge:             '7d',
        clockTimestamp:     '100',
        nonce:              'string here for OpenID',

    }
}
 
passport.use(new JwtStrategy(options,(jwt_payload,done) => {
    User.findOne({id:jwt_payload.id},(err,user) => {
        if (err) {
            return done(err, false);
        }
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
            // or you could create a new account
        }
    });
}));


passport.use(new GoogleStrategy({
        clientID:           getConfig('google.clientID'),
        clientSecret:       getConfig('google.clientSecret'),
        callbackURL:        getConfig('google.callbackURL'),
        passReqToCallback:  true
    },
    function(request, accessToken, refreshToken, profile, done) {
        console.log('request',request)
        console.log()
        console.log('accessToken',accessToken)
        console.log()
        console.log('refreshToken',refreshToken)
        console.log()
        console.log('profile',profile)
        console.log()

        // User.findOrCreate({ googleId: profile.id }, (err, user) => {
            return done(null, user);
        // });
    }
));

module.exports = {passport}