function isTodayOrFuture(dateStr) {
  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')
  const todayStr = `${yyyy}-${mm}-${dd}`

  return dateStr >= todayStr
}

module.exports = {
  isTodayOrFuture
}