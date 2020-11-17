
let data = require('./development')
    _    = require('lodash');

module.exports = getConfig = arg => {

    return _.get(data, arg)

}


