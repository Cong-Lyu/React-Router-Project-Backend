const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')
require('dotenv').config()
const privateKey = process.env.MY_PRIVATE_KEY || fs.readFileSync(path.join(__dirname, '../../private.pem'), 'utf8')
const publicKey = process.env.MY_PUBLIC_KEY || fs.readFileSync(path.join(__dirname, '../../public.pem'), 'utf8')
const clientId = `921371467501-6a2oag4udjf0a2u1db7a4n7teuk26q63.apps.googleusercontent.com`
const { OAuth2Client } = require('google-auth-library')
const client = new OAuth2Client(clientId)
const jwt = require('jsonwebtoken')
const { insertUsers, updateUserLastLogIn, findUserId } = require('../util/reactRouterDb.js')
const { googleJwtVerify, userJwtIssuer } = require('../util/jwtGenerator.js')
const { jwtVerify } = require('../middleware/jwtVerify.js')
const { userInfoCollect } = require('../middleware/userInfoProcess.js')

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

router.get('/jwtVarify', jwtVerify, (req, res) => {
  res.status(200).json({'status': true, 'userId': res.locals.googlePayload.sub})
})

router.get('/userInfo', jwtVerify, userInfoCollect, (req, res) => {
  res.status(200).json({'userInfo': res.locals.userInfo, 'status': true})
})

module.exports = router