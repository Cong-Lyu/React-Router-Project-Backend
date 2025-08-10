const express = require('express')
const cors = require('cors');
const routerToken = require('./src/routes/tokenRoutes.js')
const routerPicture = require('./src/routes/publicPictureRoutes.js')

const reactRouterServer = express()
reactRouterServer.use(cors());
reactRouterServer.use(express.json());
reactRouterServer.use(express.urlencoded({ extended: true }));

reactRouterServer.use('/api/token', routerToken)
reactRouterServer.use('/api/public', routerPicture)

reactRouterServer.listen(5000, () => {
  console.log('Now react Router SERVER is listening request at 5000......')
})
