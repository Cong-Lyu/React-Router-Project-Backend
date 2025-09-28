const express = require('express')
const router = express.Router()
require('dotenv').config();
const { jwtVerify } = require('../middleware/jwtVerify.js')
const { getVideoList } = require('../util/reactRouterDb.js')

router.get('/userVideoList', jwtVerify, async (req, res) => {
  const videoList = await getVideoList(res.locals.googlePayload.sub)
  res.status(200).json({'status': true, 'videoList': videoList})
})

module.exports = router