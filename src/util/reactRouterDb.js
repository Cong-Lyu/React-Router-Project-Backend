const mysql2 = require('mysql2')
const dotenv = require('dotenv')
dotenv.config();

const pool = mysql2.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
}).promise()

async function insertUsers(objectId, userRole) {
  const query = `INSERT INTO users(objectId, userRole, userName, lastLogInDate) VALUES(?, ?, NULL, NOW())`
  try {
    await pool.query(query, [objectId, userRole])
  }
  catch (error) {
    console.log('INSERTION ERROR!', error)
  }
} 

async function findUserId(objectId) {
  const query = `SELECT userRole, premiumEndDate, userName FROM users WHERE objectId = ?`
  const result = await pool.query(query, [objectId])
  return result
}

async function updateUserLastLogIn(objectId) {
  const query = `UPDATE users SET lastLogInDate = NOW() WHERE objectId = ?`
  try {
    await pool.query(query, [objectId])
  }
  catch(error) {
    console.log("Error when try to update user's last log in date")
  }
}

async function updateUserRole(userRole, startDate, endDate, objectId) {
  const query = `UPDATE users SET userRole = ?, premiumStartDate = ?, premiumEndDate = ? WHERE objectId = ?`
  try {
    await pool.query(query, [userRole, startDate, endDate, objectId])
  }
  catch(error) {
    console.log("Error when try to update user's role")
  }
}

async function insertVideo(objectId, userId, fileType, fileSize) {
  const query = `INSERT INTO videos(objectId, userId, fileSize, fileType) VALUES(?, ?, ?, ?)`
  try {
    const insertResult = await pool.query(query, [objectId, userId, fileSize, fileType])
    return insertResult[0].affectedRows === 1
  }
  catch(err) {console.log(err)}
}

async function getVideoList(userId) {
  const query = `SELECT objectId FROM videos WHERE userId = ?`
  try {
    const result = await pool.query(query, [userId])
    const videoList = result[0].map((item) => {return item['objectId']})
    return videoList
  }
  catch(err) {console.log(err); return null}
}

module.exports = {
  pool,
  insertUsers,
  findUserId,
  updateUserLastLogIn,
  updateUserRole,
  insertVideo,
  getVideoList
}