const express = require('express'); //nodejs framework
const mongoose = require('mongoose'); //relatie data met mongo
const flash = require('connect-flash'); //flash error messages
const session = require('express-session'); //cookie store session id
const passport = require('passport'); //authenticatie middleware

const app = express();

// Passport Config
require('./config/passport')(passport);

// DB Config
const db = require('./config/keys').MongoURI;

// Connect to Mongo
mongoose.connect(db, { useNewUrlParser: true })
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));

//EJS
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));

// Bodyparser (voor req bodies)
app.use(express.urlencoded({ extended: false}));

// Express session
app.use(
    session({
      secret: 'secret',
      resave: true,
      saveUninitialized: true
    })
  );

// Passport middleware (initialiseren passport en session)
app.use(passport.initialize());
app.use(passport.session());


// Connect flash
app.use(flash());

// // Global Variabels
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
})

// Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log('Server started on port ${PORT}'));