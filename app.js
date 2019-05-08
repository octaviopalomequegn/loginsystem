const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
const Pool = require('pg').Pool

const db = require('./queries')

var pgp = require("pg-promise")(/*options*/);

var db = pgp("postgres://postgres:password@5432:/auth_sess");

const TWO_HOURS = 1000 * 60 * 60 * 2

const {
    PORT = 3000,
    NODE_ENV = 'development',

    SESS_NAME = 'sid',
    SESS_SECRET = 'ssh!quit,it\'asecret!',
    SESS_LIFETIME = TWO_HOURS
} = process.env

const IN_PROD = NODE_ENV === 'production'

//SMALL DATABASE PRUEBAS
////////////////////////


//TODO DB
const users = [
    {id: 1, name: 'Alex', email: 'alex@gmail.com', password:'secret'},
    {id: 2, name: 'Max', email: 'max@gmail.com', password:'secret'},
    {id: 3, name: 'Hagard', email: 'hagard@gmail.com', password:'secret'},
]

const app = express()

app.use(bodyParser.urlencoded({
    extended: true
}))

//SESSION REQUIREMENTS
//////////////////////

app.use(session({
    name: SESS_NAME,
    resave: false,
    saveInitialized: false,
    secret: SESS_SECRET,
    cookie: {
        maxAge: SESS_LIFETIME,
        sameSite: true,
        secureValue: IN_PROD
    }
}))


//Redirections implementations
//////////////////////////////

const redirectLogin = (req, res, next) => {
    if(!req.session.userId) {
        res.redirect('/login')
    } else {
        next()
    }
}

const redirectHome = (req, res, next) => {
    if(req.session.userId) {
        res.redirect('/home')
    } else {
        next()
    }
}

//HTTPS Requests
////////////////

app.use((req, res, next) => {
    const { userId } = req.session
    if (userId) {
        res.locals.user = users.find(
            user => user.id === userId
        )
    }
    next()
})

app.get('/', (req, res) => {
    const { userId } = req.session
    console.log(userId)
    res.send(`
        <h1>Welcome!</h1>
        ${userId ? `
            <a href='/home'>Home</a>
            <form method='post' action='/logout'>
                <button>Logout</button>
        </form>
        ` : `
            <a href='/login'>Login</a>
            <a href='/register'>Register</a>
        `}
    `)
})

app.get('/home', redirectLogin, (req, res) => {
    const { user } = res.locals
    console.log(req.sessionID)
    console.log(req.session)

    res.send(`
        <h1>Main Page</h1>
        <a href='/'>Main</a>
        <ul>
            <li>Name: ${user.name}</li>
            <li>Email: ${user.email}</li>
        </ul>
    `)
})

app.get('/login', redirectHome, (req, res) => {
    res.send(`
        <h1>Login</h1>
        <form method='post' action='/login'>
            <input type='email' name='email' placeholder='Email' required />
            <input type='password' name='password' placeholder='Password' required />
            <input type='submit' />
        </form>
        <a href='/register'>Register</a>
    `)
})

app.get('/register', redirectHome, (req, res) => {
    res.send(`
        <h1>Register</h1>
        <form method='post' action='/register'>
            <input name='name' placeholder='Name' required />
            <input type='email' name='email' placeholder='Email' required />
            <input type='password' name='password' placeholder='Password' required />
            <input type='submit' />
        </form>
        <a href='/login'>Login</a>
    `)

})



app.post('/login', redirectHome, (req, res) => {
    const { email, password } = req.body

    if (email && password) { //TODO BETTER VALIDATION
        const user = users.find(
            user => user.email === email && user.password === password //TODO HASH
        )

        if (user) {
            req.session.userId = user.id
            return res.redirect('/home')
        }
    }
    res.redirect('/login')
})

/* app.post('/register', redirectHome, (req, res) => {
    const { name, email, password } = req.body

    if (name && email && password) { //TODO BETTER VALIDATION
        const exists = users.some(
            user => user.email === email
        )

        if (!exists) {
            const user = {
                id: users.length + 1,
                name,
                email,
                password //TODO HASH
            }

            users.push(user)

            req.session.userId = user.id

            return res.redirect('/home')
        }
    }

    res.redirect('/register') //TODO qs error
}) */

app.post('/register', redirectHome, (req, res) => {
    const { name, email, password } = req.body
    console.log('marca')
    pool.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3)', [name, email, password], (error, results) => {
    if (error) {
      throw error
    }
    res.status(201).send(`User added with ID: ${res.insertId}`)
    return res.redirect('/login')
})
    res.redirect('/register') //TODO qs error
})


app.post('/logout', redirectLogin, (req, res) => {
    req.session.destroy (err => {
        if (err) {
            return res.redirect('/home')
        }
        res.clearCookie(SESS_NAME)
        res.redirect('/login')
    })
})


app.listen(PORT, () => console.log(
    `http://localhost:${PORT}}`
))