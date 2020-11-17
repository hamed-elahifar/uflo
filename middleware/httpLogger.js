module.exports = async function requestLogger(req,res,next){

  ip      = req.ip.substr(0, 7) == "::ffff:" ? req.ip.substr(7) : req.ip
  let log = `${ip} | ${req.method} | ${req.originalUrl} |\n[BODY]:${JSON.stringify(req.body,null,4)}`
  logger.access(log)
  
  req.ipAddr = req.ip.substr(0,7) == "::ffff:" ? req.ip.substr(7) : req.ip

  return next();
}