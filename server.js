if (process.env.NODE_ENV !=='production') {
    require('dotenv').config()
}

const express = require('express')
const app = express()
const bcrypt = require ('bcrypt')
const passport = require ('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
 
const initializePassport = require('./passport-config')
initializePassport(passport, // the password we are configuring
    email =>  // finding the user based on email
    users.find(user => user.email === email),
    id => users.find(user => user.id === id),
)

const users = [] // THE USER INFORMATION IS STORE HERE IN LOCAL VARIABLE INSIDE OUR SERVER. NO DATABASE IS UTILIZED IN THIS PROJECT.

app.set('view-engine', 'ejs')
app.use(express.urlencoded({extended: false})) // this line is saying that we want to be able to access our data from the form inside of our req variable and inside of our post method
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialize: false
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/',checkAuthenticated, (req, res) => {
    res.render('index.ejs', {name: req.user.name})
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs') 
})
app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: "/",
    failurRedirect : '/login',
    failureFlash: true
    
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async (req, res) => { 
  // create a new user with the correct hashed password
  try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10) // generates the hash 10 times OR SECURITY  
      users.push({
          id: Date.now().toString(),
          name: req.body.name,
          email: req.body.email,
          password: hashedPassword
      })
      res.redirect('/login')
  }  catch {
      res.redirect('/register')
  }
  console.log(users)
})
app.delete('/logout', (req,res) => {
    req.logOut()
    res.redirect('/login')
})

function checkAuthenticated(req,res,next) {
    if (req.isAuthenticated ()) {
        return next()
    } 
    res.redirect('/login')
}

function checkNotAuthenticated(req,res,next) {
    if (req.isAuthenticated ()) {
       return res.redirect('/')
    } 
    next()
}

app.listen(3000)