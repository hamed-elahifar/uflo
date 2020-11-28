const mongoose      = require('mongoose')
const {mongoDB}     = require('../startup/mongodb')

const chapterSchema = new mongoose.Schema({

    title:{
        type:           String,
        required:       true
    },
    desc:               String,

    startDate:          Date,

    order:              Number,
    courseID:{
        type:           String,
        required:       true,
        // ref:            'courses'
    },
    chapterID:{
        type:           String,
        default:        () => Math.random().toString(35).substr(2,10),
        unique:         true,
    },

},{
    timestamps:         true,
    // toObject:           {virtuals:true},
    toJSON:             {virtuals:true},
});

chapterSchema.virtual('course',{
    ref:             'courses',
    localField:      'courseID',
    foreignField:    'courseID',
    justOne:          true,
});

const   Chapter = mongoDB.model('chapters',chapterSchema,'chapters');

exports.Chapter = Chapter;