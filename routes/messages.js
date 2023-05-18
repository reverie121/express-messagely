const Router = require("express").Router;
const router = new Router();
const ExpressError = require("../expressError");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { authenticateJWT, ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const Message = require("../models/message")


/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/

router.get('/:id', async (req, res, next) => {
    try {
        const result = await Message.get(req.params.id);
        if (result.to_user.username == req.user.username || result.from_user.username == req.user.username) {
            const message = await Message.get(req.params.id);
            return res.json( { message } );
        }
        throw new ExpressError(`Unauthorized`, 401);        
    } catch(error) {
        next(error)
    }
});


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post('/', ensureLoggedIn, async (req, res, next) => {
    try {
        const message = await Message.create(req.body);
        return res.json( { message } );
    } catch(error) {
        next(error)
    }
});

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

router.post('/:id/read', async (req, res, next) => {
    try {
        const result = await Message.get(req.params.id);
        if (result.to_user.username == req.user.username) {
            const message = await Message.markRead(req.params.id);
            return res.json( { message } );
        }
        throw new ExpressError(`Unauthorized`, 401);        
    } catch(error) {
        next(error)
    }
});


module.exports = router