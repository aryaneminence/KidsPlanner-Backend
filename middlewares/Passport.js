const passport =require('passport')
const GoogleStrategy = require('passport-google-oauth2').Strategy;
passport.serializeUser(function (user, done) {
    done(null, user);
});

// used to deserialize the user
passport.deserializeUser(function (user, done) {
        done(null, user);
});

//Google strategy
passport.use(new GoogleStrategy({
    clientID: process.env.Client_ID,
    clientSecret: process.env.Client_Secret,
    callbackURL: "http://localhost:5000/google/callback",
    passReqToCallback: true
}, (request, accessToken, refreshToken, profile, done) => {
    console.log(profile)
    done(null, profile)
}));