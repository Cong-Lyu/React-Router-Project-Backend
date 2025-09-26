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
const { insertVideo } = require('../util/reactRouterDb.js')
const { googleJwtVerify, userJwtIssuer } = require('../util/jwtGenerator.js')
const { jwtVerify } = require('../middleware/jwtVerify.js')
const { userInfoCollect } = require('../middleware/userInfoProcess.js')
const { getCredential } = require('../middleware/uploadCredential.js')

router.get('/credential', jwtVerify, getCredential, (req, res) => {
  res.status(200).json({'status': true, 'credential': res.locals.credential})
})

router.post('/insertRecord', jwtVerify, async (req, res) => {
  const insertion =  await insertVideo(res.locals.googlePayload.sub, req.body.fileType, req.body.fileSize)
  if(insertion) {res.status(200).json({'insertStatus': true})}
  else {res.status(500).json({'insertStatus': false})}
})

module.exports = router