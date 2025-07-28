const tokenGenerator = require('./src/util/tokenGenerator.js')
const express = require('express')
const dotenv = require('dotenv');
dotenv.config();
const Resend = require('resend').Resend

const reactRouterServer = express()
reactRouterServer.use(express.json());
reactRouterServer.use(express.urlencoded({ extended: true }));

reactRouterServer.post('/api/tokenGenerator', async (req, res) => {
  const token = tokenGenerator()
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: req.body.email,
    subject: token,
    html: '<p>Congrats on sending your <strong>first email</strong>!</p>'
    });
    res.status(200).send('Good Job')
  }
  catch {
    res.status(404).send('Rejected')
  }
})

reactRouterServer.listen(5000, () => {
  console.log('Now react Router SERVER is listening request at 5000......')
})
