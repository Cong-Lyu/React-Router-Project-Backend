const express = require('express')
const router = express.Router()
const dotenv = require('dotenv');
dotenv.config();
const Resend = require('resend').Resend
const tokenGenerator = require('../util/tokenGenerator.js')
const { pool, insertUsers, insertToken, updateUserLastLogIn, logIn, checkTokenTime } = require('../util/reactRouterDb.js')

let token = ``

router.post('/tokenGenerator', async (req, res) => {
  token = tokenGenerator(3)
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const result = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: req.body['email'],
    subject: token,
    html: '<p>Congrats on sending your <strong>first email</strong>!</p>'
    });
    res.status(200).json({'sendTokenStatus': true})
  }
  catch {
    res.status(404).json({'sendTokenStatus': false})
  }
})

router.post('/compareToken', async (req, res) => {
  if(token === ``) {
    console.log('Why comparing the token before it is initialized???')
    res.status(404).json({'logInStatus': false})
  }
  else if(req.body['userInputToken'] === token) {
    token = ``
    const logInResult = await logIn(req.body['email'])
    if(logInResult) {
      res.status(200).json({'logInStatus': true, 'user-token': logInResult})
    }
    else {
      res.status(404).json({'logInStatus': false})
    }
  }
  else {
    res.status(404).json({'logInStatus': false})
  }
})

router.post('/tokenVarify', async (req, res) => {
  const result = await checkTokenTime(req.body['user-token'])
  res.status(200).json({'token-status': result})
})

module.exports = router