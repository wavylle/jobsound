import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth2';

const GOOGLE_CLIENT_ID = "176560673380-ofn0158e60l1kjoskprrtks3aprcuqol.apps.googleusercontent.com"
const GOOGLE_CLIENT_SECRET = "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"

passport.use(new GoogleStrategy({
    clientID:     GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://127.0.0.1:5555/google/callback",
    passReqToCallback   : true
  },
  function(request, accessToken, refreshToken, profile, done) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return done(err, profile);
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user)
})

passport.deserializeUser(function(user, done) {
  done(null, user)
})