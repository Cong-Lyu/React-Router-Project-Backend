const express = require('express')
const cors = require('cors');
const routerToken = require('./src/routes/tokenRoutes.js')
const routerPicture = require('./src/routes/publicPictureRoutes.js')
const routerJwt = require('./src/routes/jwtVerify.js')
// const cookieParser = require('cookie-parser')
require('dotenv').config();

const port = process.env.PORT || 5000
const reactRouterServer = express()
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
  allowedHeaders: ['Content-Type', 'X-My-JWT', 'X-Google-JWT'],
  methods: ['GET','POST','PUT','DELETE','OPTIONS']
}

// reactRouterServer.use(cookieParser());
reactRouterServer.use(cors(corsOptions));
reactRouterServer.use(express.json());
reactRouterServer.use(express.urlencoded({ extended: true }));

reactRouterServer.use('/api/token', routerToken)
reactRouterServer.use('/api/public', routerPicture)
reactRouterServer.use('/api/jwt', routerJwt)

reactRouterServer.listen(port, () => {
  console.log(`Now react Router SERVER is listening request at ${port}......`)
})
