const mongoose     = require('mongoose');
const {mongoDB}    = require('../startup/mongodb')


const stateSchema = new mongoose.Schema({

    stateID:{
        type:           String,
        default:        () => Math.random().toString(35).substr(2,6),
        unique:         true,
    },
    startFrame:     String,
    endFrame:       String,
    type:{
        type:       String,
        enum:       ['enter','inview']
    },
    transformation:[{
        compId:     String,
        attribute:  String,
        value:      String,
    }]

},{
    timestamps:          true,
    toJSON:              {virtuals:true},
});

const   State = mongoDB.model('states',stateSchema,'states');

exports.State = State;