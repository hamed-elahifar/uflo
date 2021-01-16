const mongoose     = require('mongoose')
const {mongoDB}    = require('../startup/mongodb')


const analyticSchema = new mongoose.Schema({

    userID:{
        type:           String,
        ref:            'users'
    },
    frameID:{
        type:           String,
        ref:            'frames'
    },
    startDate:{
        type:           Date,
        default:        Date.now
    },
    duration:           Number,

},{
    timestamps:         true,
    toJSON:             {virtuals:true},
});

analyticSchema.virtual('user',{
    ref:           'users',
    localField:    'userID',
    foreignField:  'userID',
    justOne:        true,
});
analyticSchema.virtual('frame',{
    ref:           'frames',
    localField:    'frameID',
    foreignField:  'frameID',
    justOne:        true,
});

const   Analytic = mongoDB.model('analytics',analyticSchema,'analytics');

exports.Analytic = Analytic;