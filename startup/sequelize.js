const Sequelize = require('sequelize')

sequelizeLogger = (msg) => {
    if (!getConfig('DB.debug')) return
    logger.debug('db',msg)
}

const DB = new Sequelize(
    getConfig('DB.connectionString'),  // connectionString
    {logging:sequelizeLogger}             // options
)

DB.authenticate()
    .then(() => {
        logger.info(getConfig('DB.onSuccess'));

        // mapDB.sync()
        //    .then (()=>  {console.log('map DB synced...')})
        //    .catch(err =>{console.log(err)})
    })
    .catch(err => {
        errorLog(err)
        logger.error(getConfig('DB.onError'))
    })

module.exports = {DB}