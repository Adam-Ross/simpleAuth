const express = require("express");

const router = express.Router();
const pool = require('../db/dbConfig')
const bcrypt = require('bcrypt')
const jwtGenerator = require('../utils/jwtGenerator')
const validInfo = require('../middleware/validInfo')



router.post('/register', validInfo, async (req, res) => {
    try {
       const {name, email, password} = req.body
       // check if user exists
       const user = await pool.query('SELECT * FROM users WHERE user_email = $1;', [
           email
       ]) 
       // id user exists, send back error
       if(user.rows.length !== 0) {
           res.status(402).send('user already in system')
       }
       const saltRounds = 10 
       const salt = await bcrypt.genSalt(saltRounds)
       const bcryptPassword = await bcrypt.hash(password, salt)
       const newUser = await pool.query('INSERT INTO users(user_name, user_email, user_password) VALUES($1, $2, $3) RETURNING *', [
           name, email, bcryptPassword
       ])
       const token = jwtGenerator(newUser.rows[0].user_id)
       res.json({token})
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server error')
    }
})

router.post('/login', async(req, res) => {
    try {
        // destructure 
        const {email, password} = req.body

        // check if user doesn't / does exist
        const user = await pool.query('SELECT * FROM USERS WHERE user_email = $1', [
            email
        ])
        // if not, throw error
        if(user.rows.length === 0) {
            return res.status(401).json('Password or email is wrong')
        }

        // check if incoming password is the same as the database password
        const validPass = await bcrypt.compare(password, user.rows[0].user_password)

        if(!validPass) {
            return res.status(401).json('Password or email is wrong')
        }

        // give them the JWT token
        const token = jwtGenerator(user.rows[0].user_id)

        res.json({token})

    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server error')
    }
})

module.exports = router