const fs = require('fs')
const path = require('path')
const privateKey = fs.readFileSync(path.join(__dirname, '../../private.pem'), 'utf8')
const publicKey = fs.readFileSync(path.join(__dirname, '../../public.pem'), 'utf8')
const clientId = `921371467501-6a2oag4udjf0a2u1db7a4n7teuk26q63.apps.googleusercontent.com`
const { OAuth2Client } = require('google-auth-library')
const client = new OAuth2Client(clientId)
const jwt = require('jsonwebtoken')

async function googleJwtVerify(googleToken) {
  try {
    const token = await client.verifyIdToken({idToken: googleToken, audience: clientId})
    const payload = token.getPayload()
    return payload
  }
  catch(err) {console.log(err)}
}

function userJwtIssuer(sub, userRole, premiumEndDate) {
  const myJwtPayload = {
    'sub': sub,
    'role': userRole,
    'premiumEndDate': premiumEndDate
  }

  const myJwt = jwt.sign(myJwtPayload, privateKey, {
    algorithm: 'RS256', 
    expiresIn: '1h'
  })
  return myJwt
}

module.exports = {
  googleJwtVerify,
  userJwtIssuer
}