const express = require('express')
const cors = require('cors');
const router = require('./src/routes/tokenRoutes.js')

const reactRouterServer = express()
reactRouterServer.use(cors());
reactRouterServer.use(express.json());
reactRouterServer.use(express.urlencoded({ extended: true }));

reactRouterServer.use('/api/token', router)

reactRouterServer.listen(5000, () => {
  console.log('Now react Router SERVER is listening request at 5000......')
})
