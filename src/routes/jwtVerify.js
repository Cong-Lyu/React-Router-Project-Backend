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
const { pool } = require('../util/reactRouterDb.js')

router.post('/logIn', async (req, res) => {
  try {
    const token = await client.verifyIdToken({idToken: req.body.token, audience: clientId})
    const payload = token.getPayload()
    // res.cookie('google_token', req.body.token, {
    //   httpOnly: true,
    //   secure: false,
    //   sameSite: 'lax'
    // })

    const query = `SELECT userRole, premiumEndDate, userName FROM users WHERE objectId = ?`
    const result = await pool.query(query, [payload.sub])
    if(!result[0].length) {
      const myJwtPayload = {
        'sub': payload.sub,
        'role': 'general',
        'premiumEndDate': null
      }

      const myJwt = jwt.sign(myJwtPayload, privateKey, {
        algorithm: 'RS256', 
        expiresIn: '1d'
      })

      // res.cookie('my-jwt', myJwt, {
      //   httpOnly: true,
      //   secure: false,
      //   sameSite: 'lax'
      // })
      const query = `INSERT INTO users(objectId, userRole, userName, lastLogInDate) VALUES(?, ?, NULL, NOW())`
      const insertion = await pool.query(query, [payload.sub, 'general'])
      res.status(200).json({'googleJwt': req.body.token, 'myJwt': myJwt, 'status': true})
    }
    else {
      const myJwtPayload = {
        'sub': payload.sub,
        'role': result[0][0]['userRole'],
        'premiumEndDate': result[0][0]['premiumEndDate']
      }
      const myJwt = jwt.sign(myJwtPayload, privateKey, {
        algorithm: 'RS256', 
        expiresIn: '1d'
      })

      // res.cookie('my-jwt', myJwt, {
      //   httpOnly: true,
      //   secure: false,
      //   sameSite: 'lax'
      // })
      const query = `UPDATE users SET lastLogInDate = NOW() WHERE objectId = ?`
      const updateLogindate = await pool.query(query, [payload.sub])
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
    const result1 = await client.verifyIdToken({idToken: googleJwt, audience: clientId})
    const result2 = jwt.verify(myJwt, publicKey)
    res.status(200).json({'status': true})
  }
  catch(err) {
    res.status(401).json({'status': false})
  }
})

module.exports = router