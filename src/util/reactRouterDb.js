const mysql2 = require('mysql2')
const dotenv = require('dotenv');
dotenv.config();

const pool = mysql2.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
}).promise()

async function insertUsers(record) {
  const query = `INSERT INTO users(objectId, userName, userHashedPassword, lastLogInDate) VALUES(?, ?, ?, NOW())`
  const objectId = tokenGenerator(32)
  try {
    await pool.query(query, [objectId, record['userName'], record['password']])
    return true
  }
  catch (error) {
    console.log('INSERTION ERROR!', error)
    return false
  }
} 

async function findUserId(email) {
  const query = `SELECT objectId FROM users WHERE userName = ?`
  const result = await pool.query(query, [email])
  if(result[0].length === 1) {
    return result[0]
  }
  else {
    return false
  }
}

async function insertToken(email) {
  const findIdResult = await findUserId(email)
  if(findIdResult) {
    const userId = findIdResult[0]['objectId']
    const token = tokenGenerator(32)
    const selectQuery = `SELECT * FROM token WHERE userId = ?`
    const selectResult = await pool.query(selectQuery, [userId])
    if(selectResult[0].length === 0) { //This means that this userId is a new sign up user
      const insertQuery = `INSERT INTO token(token, userId) VALUES(?, ?)`
      try {
        await pool.query(insertQuery, [token, userId])
        return token
      }
      catch (error) {
        console.log('Something wrong happened when inserting a token.', error)
        return false
      }
    }
    else if(selectResult[0].length === 1) {
      const updateQuery = `UPDATE token SET token = ?, createDate = NOW() WHERE userId = ?`
      try {
        await pool.query(updateQuery, [token, userId])
        return token
      }
      catch (error) {
        console.log('Something wrong happened when updating a token.', error)
        return false
      }
    }
    else {
      console.log('Something wrong about the result in the token table, it came out with two same userId records!')
      return false
    }
  }
  else {
    console.log('Cannot find this user in the users table.')
    return false
  }
}

async function updateUserLastLogIn(objectId) {
  const query = `UPDATE users SET lastLogInDate = NOW() WHERE objectId = ?`
  try {
    const result = await pool.query(query, [objectId])
    return true
  }
  catch(error) {
    console.log("Error when try to update user's last log in date")
    return false
  }
}

async function logIn(email) {
  const query = `SELECT * FROM users WHERE userName = ?`
  const result = await pool.query(query, [email])
  if(result[0].length === 0) {
    const insertResult = await insertUsers({'userName': email, 'password': null})
    if(insertResult) {
      const token = await insertToken(email)
      return token
    }
    else {
      console.log('Something wrong with inserting a new user into db.')
      return false
    }
  }
  else if(result[0].length === 1) {
    const objectId = result[0][0]['objectId'] // get the objectId of the user to update his last log in date.
    await updateUserLastLogIn(objectId)
    const token = await insertToken(email)
    return token
  }
  else {
    console.log('Disastrous things happened. There are two records with the same userName!!')
    return false
  }
} 

async function checkTokenTime(token) {
  const query = `SELECT TIMESTAMPDIFF(HOUR, createDate, NOW()) AS HourDiff FROM token WHERE token = ?;`
  const result = await pool.query(query, [token])
  console.log('token varify result:', result, typeof result[0][0]['HourDiff'], result[0][0]['HourDiff'] > 2)
  if(result[0][0]['HourDiff'] > 2) {
    return false
  }
  else {
    return true
  }
}

module.exports = {
  pool,
  insertUsers,
  insertToken,
  updateUserLastLogIn,
  logIn,
  checkTokenTime
}