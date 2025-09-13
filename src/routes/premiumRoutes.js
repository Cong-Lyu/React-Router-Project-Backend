const express = require('express')
const router = express.Router()
const Stripe = require('stripe')
require('dotenv').config();
const fs = require('fs')
const path = require('path')
const privateKey = fs.readFileSync(path.join(__dirname, '../../private.pem'), 'utf8')
const publicKey = fs.readFileSync(path.join(__dirname, '../../public.pem'), 'utf8')
const clientId = `921371467501-6a2oag4udjf0a2u1db7a4n7teuk26q63.apps.googleusercontent.com`
const { OAuth2Client } = require('google-auth-library')
const client = new OAuth2Client(clientId)
const jwt = require('jsonwebtoken')
const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

router.post('/payment', async (req, res) => {
  const { paymentId, premiumType, length, startDate, endDate, returnUrl } = req.body
  const plansAmount = {
    'Yourself-only': 1599,
    'Family-set': 3899,
    'Two-people': 2499,
    'Student-plan': 999
  }
  const amount = plansAmount[premiumType] * length
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,            
      currency: 'usd',           
      payment_method: paymentId, 
      confirm: true,
      return_url: returnUrl
    })
    console.log(paymentIntent)

    if(paymentIntent.status === 'succeeded') {
      const myJwt = req.headers['x-my-jwt']
      const googleJwt = req.headers['x-google-jwt']
      const token = await client.verifyIdToken({idToken: googleJwt, audience: clientId})
      const payload = token.getPayload()
      jwt.verify(myJwt, publicKey)

      const vipJwtPayload = {
      'sub': payload.sub,
      'role': 'vip',
      'vipEndDate': endDate
      }
      const newVipJwt = jwt.sign(vipJwtPayload, privateKey, {
        algorithm: 'RS256', 
        expiresIn: '1d'
      })

      return res.status(200).json({ 
        'payment-status': true, 
        'paymentIntentId': paymentIntent.id, 
        'googleJwt': req.headers['x-google-jwt'], 
        'myJwt': newVipJwt
      })
    } else {
      return res.status(200).json({ 'payment-status': false })
    }
  } 
  catch(err) {
    console.error(err)
    return res.json({ 'payment-status': false, 'error': err.message })
  }
})

module.exports = router