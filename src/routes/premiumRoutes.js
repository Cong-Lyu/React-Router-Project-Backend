const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')
require('dotenv').config()
const privateKey = process.env.MY_PRIVATE_KEY || fs.readFileSync(path.join(__dirname, '../../private.pem'), 'utf8')
const publicKey = process.env.MY_PUBLIC_KEY || fs.readFileSync(path.join(__dirname, '../../public.pem'), 'utf8')
const jwt = require('jsonwebtoken')
const { userJwtIssuer, googleJwtVerify } = require('../util/jwtGenerator.js')
const { updateUserRole } = require('../util/reactRouterDb.js')
const { paymentProcessor } = require('../util/premiumPaymentProcessor.js')
const { isTodayOrFuture } = require('../util/premiumLogic.js')

router.post('/payment', async (req, res) => {
  const { paymentId, premiumType, length, 'start-date': startDate, 'end-date': endDate, returnUrl } = req.body
  try {
    const paymentIntent = await paymentProcessor(length, premiumType, paymentId, returnUrl)
    if(paymentIntent.status === 'succeeded') {
      const myJwt = req.headers['x-my-jwt']
      const googleJwt = req.headers['x-google-jwt']
      const payload = await googleJwtVerify(googleJwt)
      jwt.verify(myJwt, publicKey)
      const newVipJwt = await userJwtIssuer(payload.sub, 'premium', endDate)

      await updateUserRole('premium', startDate, endDate, payload.sub)
      res.status(200).json({ 
        'payment-status': true, 
        'paymentIntentId': paymentIntent.id, 
        'googleJwt': req.headers['x-google-jwt'], 
        'myJwt': newVipJwt
      })
    } else {
      res.status(200).json({ 'payment-status': false })
    }
  } 
  catch(err) {
    console.error(err)
    return res.json({ 'payment-status': false, 'error': err.message })
  }
})

router.get('/premiumCheck', async (req, res) => {
  try {
    const myJwt = req.headers['x-my-jwt']
    const googleJwt = req.headers['x-google-jwt']
    const payload = await googleJwtVerify(googleJwt)
    jwt.verify(myJwt, publicKey)
    const myPayload = jwt.decode(myJwt)

    if(myPayload['role'] === 'premium' && isTodayOrFuture(myPayload['premiumEndDate'])) {res.status(200).json({'premium-status': true})}
    else {res.status(401).json({'premium-status': false})}
  }
  catch(err) {console.log(err); res.status(401).json({'premium-status': false})}
})

module.exports = router