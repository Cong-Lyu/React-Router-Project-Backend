const privateKey = process.env.MY_PRIVATE_KEY
const publicKey = process.env.MY_PUBLIC_KEY
const clientId = `921371467501-6a2oag4udjf0a2u1db7a4n7teuk26q63.apps.googleusercontent.com`
const { OAuth2Client } = require('google-auth-library')
const client = new OAuth2Client(clientId)
const jwt = require('jsonwebtoken')

async function jwtVerify(req, res, next) {
  const myJwt = req.headers['x-my-jwt']
  const googleJwt = req.headers['x-google-jwt']
  try {
    const token = await client.verifyIdToken({idToken: googleJwt, audience: clientId})
    const payload = token.getPayload()
    const myJwtPayload = jwt.verify(myJwt, publicKey)
    res.locals.googlePayload = payload
    res.locals.myJwtPayload = myJwtPayload
    next()
  }
  catch(err) {
    res.status(401).json({'status': false})
  }
} 

module.exports = {
  jwtVerify
}