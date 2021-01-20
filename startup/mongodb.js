
const mongoose  = require('mongoose').Mongoose

const options   = {
    useNewUrlParser:      true,
    useCreateIndex:       true,
    useFindAndModify:     false,
    // autoIndex:          false,            // Don't build indexes
    poolSize:             10,
    bufferMaxEntries:     0,
    connectTimeoutMS:     5000,
    family:               4,
    useUnifiedTopology:   true,
};

mongoDB = new mongoose();

mongoDB.connection.on('reconnected',() => {
    logger.info('MongoDB reconnected!');
});
mongoDB.connection.on('disconnected',() => {
    logger.info('MongoDB disconnected!');
    mongoDBConnection();
});

mongoDBConnection = function() {
    try{
        mongoDB.connect(getConfig('mongoDB.connectionString'),options)
            .then (async (connection) => {
                logger.info(getConfig('mongoDB.onSuccess'))
            })
            .catch (err => {
                errorLog(err)
                logger.info(getConfig('mongoDB.onError'))
            });
    }
    catch(err){
        logger.error(err)
    }
}

// create admin user of no user exist
mongoDB.connection.once('open',async()=>{

})


// if (getConfig('mongoDB.debug')){
//     mongoDB.set('debug',function(collectionName,method,query,doc){
    
//         const txt = `Mongoose: ${collectionName} ${method} (
// ${JSON.stringify(query,null,4)}
// ${JSON.stringify(doc,null,2)}
// )`
//         logger.debug(txt)
//     });
// }

module.exports = {
    mongoDB,
    mongoDBConnection,
}
