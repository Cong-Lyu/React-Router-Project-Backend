const express = require('express')
const cors = require('cors');
const routerPicture = require('./src/routes/publicPictureRoutes.js')
const routerJwt = require('./src/routes/jwtVerifyRoutes.js')
const routerPremium = require('./src/routes/premiumRoutes.js')
const routerUpload = require('./src/routes/getCredential.js')
const routerUser = require('./src/routes/user.js')
// const cookieParser = require('cookie-parser')
require('dotenv').config();

const port = process.env.PORT || 5000
const reactRouterServer = express()
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://shirahama-react-app-static.s3-website-ap-southeast-2.amazonaws.com'
  ],
  credentials: true,
  allowedHeaders: ['Content-Type', 'X-My-JWT', 'X-Google-JWT'],
  methods: ['GET','POST','PUT','DELETE','OPTIONS']
}

// reactRouterServer.use(cookieParser());
reactRouterServer.use(cors(corsOptions));
reactRouterServer.use(express.json());
reactRouterServer.use(express.urlencoded({ extended: true }));

reactRouterServer.use('/api/public', routerPicture)
reactRouterServer.use('/api/jwt', routerJwt)
reactRouterServer.use('/api/premium', routerPremium)
reactRouterServer.use('/api/upload', routerUpload)
reactRouterServer.use('/api/user', routerUser)

reactRouterServer.listen(port, () => {
  console.log(`Now react Router SERVER is listening request at ${port}......`)
})
