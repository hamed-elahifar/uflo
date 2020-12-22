const mongoose     = require('mongoose')
const {mongoDB}    = require('../startup/mongodb')

const annotationSchema  = new mongoose.Schema({

    annotationID:{
        type:           String,
        default:        () => Math.random().toString(35).substr(2,11),
        unique:         true,
    },
    desc:               String,
    type:{
        type:           String,
        enum:           ['highlight','annotation','question'],
    },
    tag:                [String],
    selection:{
        frameID:{
            type:       String,
            ref:        'frames'
        },
        startIndex:     Number,
        selectLength:   Number,
        quote:          String
    },
    color:              String,
    userID:{
        type:           String,
        ref:            'users'
    },
    whoToAsk:{
        type:           String,
        enum:           ['professor','TA','everyone']
    },
    likes:              Number,
    descLength:         Number,
    anntLength:         Number,
    solved:             Boolean,
    reply:{
        replyText:      String,
        userID:         String,
        solution:       Boolean,
    },
    lobjID:{
        type:           String,
        ref:            'lobjs'
    }

},{
    timestamps:          true,
    toJSON:              {virtuals:true},
});

annotationSchema.virtual('frame',{
    ref:           'frames',
    localField:    'frameID',
    foreignField:  'frameID',
    justOne:        true,
});
annotationSchema.virtual('lobj',{
    ref:           'lobjs',
    localField:    'lobjID',
    foreignField:  'lobjID',
    justOne:        true,
});

const   Annotation = mongoDB.model('annotation',annotationSchema,'annotation');

exports.Annotation = Annotation;