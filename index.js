if (process.env.NODE_ENV !== 'production') { //zet alle data in .env zodat het veilig staat
  require('dotenv').config()
}

const port = process.env.PORT || 3010

const express = require('express')    //node js web application framework
const app = express()
const bcrypt = require('bcrypt')      //secure passwords met hashpasswords
const passport = require('passport')  //authenticatie voor passwords
const flash = require('express-flash') //geeft berichten wanneer email of bijv. wachtwoord verkeerd is
const session = require('express-session') //zodat data van gebruiker op meerdere pagina's te gebruiken is
const methodOverride = require('method-override')

const MongoClient = require('mongodb').MongoClient;

// const uri = "mongodb+srv://test:test123@matchcluster.fynou.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });
// run().catch(console.dir);

// ///////


app.set('view-engine', 'ejs')
app.set('views', __dirname + '/views')

const initializePassport = require('./passport-config')    //passport functie oproepen
initializePassport(
  passport,
  email => users.find(user => user.email === email), //user vinden gebaseerd op email
  id => users.find(user => user.id === id)
)

let bodyParser = require('body-parser')

const users = []    //users in lokaal variabel inplaats van database

app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,   ///.env opvragen zodat code veilig is
  resave: false,                        //niet resaven als niks veranderd is
  saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))


//functions
function checkAuthenticated(req, res, next) {   //als user authenticated is, verder gaan
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {  //als user niet authenticated is, terug naar index
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}


// Static files
app.use(express.static('static'))
app.use('/css', express.static(__dirname + 'static/css'))
app.use('/js', express.static(__dirname + 'static/js'))
app.use('/img', express.static(__dirname + 'static/img'))

//Gebruiker registreren
app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    })
    res.redirect('/login')      //als account maken gelukt is, gebruiker doorverwijzen naar login
  } catch {
    res.redirect('/register')   //als het niet lukt, opnieuw gebruiker doorverwijzen naar register
  }
})


//Routes
app.get('/', checkAuthenticated, (req, res) => {
  res.render('index.ejs', { name: req.user.name })
})

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs')
})

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

app.delete('/logout', (req, res) => {
  req.logOut()
  res.redirect('/login')
})


app.get('/about', (req, res) => {
  res.render('about', { text: 'About Page' })
})


app.listen(port, () => {
  console.log(`Example app listening at port 3010`)
})


app.use(function (req, res, next) {
  res.status(404).send('Error 404! Deze pagina bestaat niet!');
});