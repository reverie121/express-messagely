const Router = require("express").Router;
const router = new Router();
const ExpressError = require("../expressError");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const User = require("../models/user")

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

router.post('/login', async (req, res, next) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
        throw new ExpressError("Username and password required", 400);
        }
        let valid = await User.authenticate(username, password);
        if (valid) {
            const token = jwt.sign({ username }, SECRET_KEY);
            return res.json({ token })
        }
        throw new ExpressError("Invalid username/password", 400);
    } catch (error) {
        return next(error);
    }
  })


/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post('/register', async (req, res, next) => {
    try {
        let {username} = await User.register(req.body);
        let token = jwt.sign({username}, SECRET_KEY);
        return res.json({token});
    } catch (error) {
        return next(error)
    }
  });

  module.exports = router