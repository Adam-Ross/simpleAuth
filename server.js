


const express = require('express')
const {Pool} = require('pg')


const app = express()

const PORT = 3000

const pool = new Pool({
    user: "garrettross",
    password: '',
    host: 'localhost',
    port: 5432,
    database: "jwt"
}) 

app.use(express.json())

app.use('/api/auth', require('./routes/auth'))

app.get('/', async (req, res) => {  
    try {
        const users = await pool.query('SELECT * FROM users;')
        res.json(users.rows)
    } catch (error) {
        res.status(500).send('Server error')
    }
})


app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`)
})

