const jwt = require('jsonwebtoken')
require('dotenv').config()
// takes in req, forwards to next
module.export = async (req, res, next) => {
    try {
        
        // get token

        const {token} = req.header("token")

        if(!token) {
            return res.status(403).json('Not authorized')
        }

        const payload = jwt.verify(token, process.env.secret)

        req.user = payload.user

        next()

    } catch (err) {
        return res.status(403).json('Not authorized')
    }
}