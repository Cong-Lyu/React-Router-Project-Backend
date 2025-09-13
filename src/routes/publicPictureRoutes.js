const express = require('express')
const router = express.Router()
const dotenv = require('dotenv');
dotenv.config();
const Resend = require('resend').Resend
const tokenGenerator = require('../util/tokenGenerator.js')
const { pool, insertUsers, insertToken, updateUserLastLogIn, logIn, checkTokenTime } = require('../util/reactRouterDb.js')

function splitFileName(fullName) {
  const parts = fullName.split('.')
  const extension = parts.pop() 
  const name = parts.join('.');         
  return [name, extension]
}

function refactor(list) {
  const list2 = []
  for(const i of list) {
    const string = i['fullName']
    const namePart = string.slice(0, string.length - 3)
    const extensionPart = string.slice(string.length - 3)
    const total = namePart + '.' + extensionPart
    list2.push(total)
  }
  return list2
}


router.get('/:type', async (req, res) => {
  const leafFolderName = req.params['type']
  const keyValuePair = req.query
  const amount = Number(keyValuePair['amount'])
  const lastPicture = keyValuePair['last']
  
  let query
  if(lastPicture !== undefined) {
    query = `SELECT fullName 
              FROM (
                        SELECT 
                          CONCAT(pictureName, pictureExtension) AS fullName,
                          ROW_NUMBER() OVER (ORDER BY id) AS rn
                        FROM videopictures
                        WHERE leafFolderName = ?
                      ) AS temp3
              WHERE rn > (
                        SELECT rn FROM (
                          SELECT 
                            CONCAT(pictureName, pictureExtension) AS fullName,
                            ROW_NUMBER() OVER (ORDER BY id) AS rn
                          FROM videopictures
                          WHERE leafFolderName = ?
                        ) AS temp
                        WHERE fullName = ?
                      )
              AND rn <= (
                        (SELECT rn FROM (
                            SELECT 
                              CONCAT(pictureName, pictureExtension) AS fullName,
                              ROW_NUMBER() OVER (ORDER BY id) AS rn
                            FROM videopictures
                            WHERE leafFolderName = ?
                          ) AS temp
                          WHERE fullName = ?
                        ) + ?
              )`
  }
  else {
    query = `SELECT 
              CONCAT(pictureName, pictureExtension) AS fullName
            FROM 
              videopictures
            WHERE 
              leafFolderName = ?
            ORDER BY 
              id
            LIMIT ?`
  }
  
  try {
    let result
    if(lastPicture !== undefined) {
      const parts = splitFileName(lastPicture)
      const lastPictureName = parts[0] + parts[1]
      result = await pool.query(query, [leafFolderName, leafFolderName, lastPictureName, leafFolderName, lastPictureName, amount])
    }
    else {
      result = await pool.query(query, [leafFolderName, amount])
    }

    const list = refactor(result[0])
    res.status(200).json({'accessPicturesStatus': true, 'pictureList': list})
  }
  catch(err) {
    console.log('Something wrong when accessing the picture names', err)
    res.status(404).json({'accessPicturesStatus': false})
  }
})

router.post('/:type', async (req, res) => {
  const objectId = tokenGenerator(32)
  const leafFolder = req.params['type']
  const query = `INSERT INTO videopictures(objectId, pictureName, pictureExtension, leafFolderName) VALUES(?, ?, ?, ?)`
  try {
    await pool.query(query, [objectId, req.body['pictureName'], req.body['pictureExtension'], leafFolder])
    res.status(200).json({'insertPictureStatus': true})
  }
  catch(err) {
    console.log(err)
    res.status(404).json({'insertPictureStatus': false})
  }
})

module.exports = router