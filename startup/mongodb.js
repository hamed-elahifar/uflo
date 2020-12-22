
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
    console.log('MongoDB reconnected!');
});
mongoDB.connection.on('disconnected',() => {
    console.log('MongoDB disconnected!');
    mongoDBConnection();
});

mongoDBConnection = function() {
    try{
        mongoDB.connect(getConfig('mongoDB.connectionString'),options)
            .then (async (connection) => {
                console.log(getConfig('mongoDB.onSuccess'))
            })
            .catch (err => {
                errorLog(err)
                console.log(getConfig('mongoDB.onError'))
            });
    }
    catch(err){
        console.log(err)
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
