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
    tags:               [String],
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
    whomToAsk:{
        type:           String,
        enum:           ['professor','TA','everyone']
    },
    likes:{
        type:           [String],
        ref:            'users',
    },
    descLength:         Number,
    anntLength:         Number,
    solved:{
        type:           Boolean,
        default:        false
    },
    reply:[{
        replyText:      String,
        userID:         String,
        solution:       Boolean,
    }],
    lessonID:{
        type:           String,
        ref:            'lessons'
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
annotationSchema.virtual('likesInfo',{
    ref:           'users',
    localField:    'likes',
    foreignField:  'userID',
});
const   Annotation = mongoDB.model('annotation',annotationSchema,'annotation');

exports.Annotation = Annotation;