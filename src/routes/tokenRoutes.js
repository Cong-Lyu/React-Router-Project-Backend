const express = require('express')
const router = express.Router()
const dotenv = require('dotenv');
dotenv.config();
const Resend = require('resend').Resend
const tokenGenerator = require('../util/tokenGenerator.js')
const pool = require('../util/reactRouterDb.js')

router.post('/tokenGenerator', async (req, res) => {
  const token = tokenGenerator()
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const result = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: req.body['email'],
    subject: token,
    html: '<p>Congrats on sending your <strong>first email</strong>!</p>'
    });
    
    res.status(200).send('Good Job')
    
  }
  catch {
    res.status(404).send('Rejected')
  }
})

module.exports = router