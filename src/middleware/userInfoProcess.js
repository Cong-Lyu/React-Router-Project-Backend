function userInfoCollect(req, res, next) {
  const info = {
    userId: res.locals.googlePayload.sub,
    userName: res.locals.googlePayload.name,
    userImg: res.locals.googlePayload.picture,
    userRole: res.locals.myJwtPayload.role
  }
  res.locals.userInfo = info
  next()
}

module.exports = {
  userInfoCollect
}