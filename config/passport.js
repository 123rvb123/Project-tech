const LocalStrategy = require('passport-local').Strategy;  //voor authenticatie met username en password
const bcrypt = require('bcryptjs');

// Load User model
const User = require('../models/User');

module.exports = function(passport) {
  passport.use(        //inloggen met email & password
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      // Match user //
      User.findOne({
        email: email  //is er een user met deze email in database checken
      }).then(user => {
        if (!user) {  //geen user
          return done(null, false, { message: 'That email is not registered' });
        }

        // Match password
        bcrypt.compare(password, user.password, (err, isMatch) => { //password vergelijken & kijken of matched
          if (err) throw err;
          if (isMatch) {
            return done(null, user);
          } else {  //(null voor error, false voor user)
            return done(null, false, { message: 'Password incorrect' });
          }
        });
      });
    })
  );

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
};
