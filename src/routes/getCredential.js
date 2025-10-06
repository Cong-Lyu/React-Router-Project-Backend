const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')
require('dotenv').config()
const privateKey = process.env.MY_PRIVATE_KEY ? process.env.MY_PRIVATE_KEY.replace(/\\n/g, '\n') : fs.readFileSync(path.join(__dirname, '../../private.pem'), 'utf8')
const publicKey = process.env.MY_PUBLIC_KEY ? process.env.MY_PUBLIC_KEY.replace(/\\n/g, '\n') : fs.readFileSync(path.join(__dirname, '../../public.pem'), 'utf8')
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
  res.status(200).json({'status': true, 'credential': res.locals.credential, 'videoId': res.locals.videoId})
})

router.post('/insertRecord', jwtVerify, async (req, res) => {
  const insertion =  await insertVideo(req.body.videoId, res.locals.googlePayload.sub, req.body.fileType, req.body.fileSize, req.body.videoTitle)
  if(insertion) {res.status(200).json({'insertStatus': true})}
  else {res.status(500).json({'insertStatus': false})}
})

module.exports = router