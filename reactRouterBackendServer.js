const express = require('express')
const cors = require('cors');
const routerToken = require('./src/routes/tokenRoutes.js')
const routerPicture = require('./src/routes/publicPictureRoutes.js')
require('dotenv').config();
const port = process.env.PORT || 5000

const reactRouterServer = express()
reactRouterServer.use(cors());
reactRouterServer.use(express.json());
reactRouterServer.use(express.urlencoded({ extended: true }));

reactRouterServer.use('/api/token', routerToken)
reactRouterServer.use('/api/public', routerPicture)

reactRouterServer.listen(port, () => {
  console.log(`Now react Router SERVER is listening request at ${port}......`)
})
