
const fs        = require('fs');
const {join}    = require('path');

const path      = join(__dirname,global.environment+'.js')

let data;

if   (fs.existsSync(path)) {
    data        = require(path)
}
else if (fs.existsSync(join(__dirname,'./development.js'))) {
    data        = require('./development')
} else {
    throw Error('config file not found') 
}

module.exports = getConfig = arg => {

    return _.get(data, arg)

}


