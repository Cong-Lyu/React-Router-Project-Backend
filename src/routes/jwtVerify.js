const express = require('express')
const router = express.Router()
require('dotenv').config();
const fs = require('fs')
const path = require('path')
const privateKey = fs.readFileSync(path.join(__dirname, '../../private.pem'), 'utf8')
const publicKey = fs.readFileSync(path.join(__dirname, '../../public.pem'), 'utf8')
const clientId = `921371467501-6a2oag4udjf0a2u1db7a4n7teuk26q63.apps.googleusercontent.com`
const { OAuth2Client } = require('google-auth-library')
const client = new OAuth2Client(clientId)
const jwt = require('jsonwebtoken')
const { insertUsers, updateUserLastLogIn, findUserId } = require('../util/reactRouterDb.js')
const { googleJwtVerify, userJwtIssuer } = require('../util/jwtGenerator.js')

router.post('/logIn', async (req, res) => {
  try {
    const payload = await googleJwtVerify(req.body.token)
    // res.cookie('google_token', req.body.token, {
    //   httpOnly: true,
    //   secure: false,
    //   sameSite: 'lax'
    // })

    const result = await findUserId(payload.sub)
    if(!result[0].length) {
      const myJwt = userJwtIssuer(payload.sub, 'general', null)
      // res.cookie('my-jwt', myJwt, {
      //   httpOnly: true,
      //   secure: false,
      //   sameSite: 'lax'
      // })
      await insertUsers(payload.sub, 'general')
      res.status(200).json({'googleJwt': req.body.token, 'myJwt': myJwt, 'status': true})
    }
    else {
      const myJwt = userJwtIssuer(payload.sub, result[0][0]['userRole'], result[0][0]['premiumEndDate'])
      // res.cookie('my-jwt', myJwt, {
      //   httpOnly: true,
      //   secure: false,
      //   sameSite: 'lax'
      // })
      await updateUserLastLogIn(payload.sub)
      res.status(200).json({'googleJwt': req.body.token, 'myJwt': myJwt, 'status': true})
    }
  }
  catch(err) {
    console.log(err)
    res.status(401).json({'status': false})
  }
})

router.get('/jwtVarify', async (req, res) => {
  const myJwt = req.headers['x-my-jwt']
  const googleJwt = req.headers['x-google-jwt']
  try {
    await client.verifyIdToken({idToken: googleJwt, audience: clientId})
    jwt.verify(myJwt, publicKey)
    res.status(200).json({'status': true})
  }
  catch(err) {
    res.status(401).json({'status': false})
  }
})

module.exports = router