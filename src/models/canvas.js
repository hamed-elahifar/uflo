const mongoose      = require('mongoose')
const {mongoDB}     = require('../startup/mongodb')

const canvasSchema  = new mongoose.Schema({

    canvasID:{
        type:           String,
        default:        () => Math.random().toString(35).substr(2,6),
        unique:         true,
    },
    lobjID:{
        type:           String,
        required:       true,
        ref:            'lobjs'
    },
    type:{
        type:           String,
        enum:           ['Desmos']
    },
    stateZero:          String,

},{
    timestamps:          true,
    toJSON:              {virtuals:true},
});

canvasSchema.virtual('lobj',{
    ref:           'lobjs',
    localField:    'lobjID',
    foreignField:  'lobjID',
    justOne:        true,
});

const   Canvas = mongoDB.model('canvas',canvasSchema,'canvas');

exports.Canvas = Canvas;