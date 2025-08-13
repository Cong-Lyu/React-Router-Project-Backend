const cors = require('cors');
const routerToken = require('./src/routes/tokenRoutes.js')
const routerPicture = require('./src/routes/publicPictureRoutes.js')
require('dotenv').config();
const keyId = process.env.keyID
const applicationKey = process.env.applicationKey
const bucketId = process.env.bucketId

const reactRouterServer = express()
reactRouterServer.use(cors());
reactRouterServer.use(express.json());
reactRouterServer.use(express.urlencoded({ extended: true }));

reactRouterServer.use('/api/token', routerToken)
reactRouterServer.use('/api/public', routerPicture)

reactRouterServer.get('/api/downloadToken', async (req, res) => {
  try {
    const token1Header = 'Basic ' + Buffer.from(`${keyId}:${applicationKey}`).toString('base64')
    console.log('Authorization header:', token1Header)
    const token1Url = 'https://api.backblazeb2.com/b2api/v3/b2_authorize_account'
    const token1Fetch = await fetch(token1Url, {
      method: 'GET',
      headers: {
        'Authorization': token1Header
      }
    })
    const token1Result = await token1Fetch.json()

    const downloadUrl = token1Result['apiInfo']['storageApi']['downloadUrl'] + '/file/publicFileBucket'
    const tokenForDownloadUrl = token1Result['apiInfo']['storageApi']['apiUrl'] + '/b2api/v4/b2_get_download_authorization'
    const authenToken = token1Result['authorizationToken']

    const tokenForDownload = await fetch(tokenForDownloadUrl, {
      method: 'POST',
      headers: {
        'Authorization': authenToken
      },
      body: JSON.stringify({
        "bucketId": bucketId,
        "fileNamePrefix": "",
        "validDurationInSeconds": 3600
      })
    })

    const tokenForDownloadResult = await tokenForDownload.json()
    const downloadToken = tokenForDownloadResult["authorizationToken"]
    const result = {
      'tokenStatus': true,
      'downloadUrl': downloadUrl,
      'downloadTempToken': downloadToken
    }
    res.status(200).json(result)
  }
  catch(err) {
    console.log(err)
    res.status(400).json({'tokenStatus': false})
  }
})

reactRouterServer.listen(5000, () => {
  console.log('Now react Router SERVER is listening request at 5000......')
})
