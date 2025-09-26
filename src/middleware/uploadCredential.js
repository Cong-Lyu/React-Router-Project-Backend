const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

async function getCredential(req, res, next) {
  try {
    const userId = res.locals.googlePayload.sub
    const s3Client = new S3Client({ 
      region: "ap-southeast-2",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    })
    const fileName = userId
    const fileType = req.query.fileType
    if(!fileName || !fileType) {return res.status(400).json({ status: false, message: "Missing fileName or fileType" })}

    const command = new PutObjectCommand({
      Bucket: "shirahama-videos",
      Key: fileName,
      ContentType: fileType,
    })

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 120 })
    res.locals.credential = uploadUrl
    next()
  }
  catch(err) {console.log(err); res.status(500).json({'status': false})}
}

module.exports = {
  getCredential
}