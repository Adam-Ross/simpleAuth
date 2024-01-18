const express = require("express");

const router = express.Router();
const pool = require('../db/dbConfig')
const bcrypt = require('bcrypt')
const jwtGenerator = require('../utils/jwtGenerator')



router.post('/register', async (req, res) => {
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

    } catch (error) {
        res.send('not right.')
    }
})

module.exports = router