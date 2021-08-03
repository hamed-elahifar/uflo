const mongoose     = require('mongoose')
const {mongoDB}    = require('../startup/mongodb')

const frameSchema  = new mongoose.Schema({

    title:              String,
    frameID:{
        type:           Number,
        // default:        () => Math.random().toString(35).substr(2,10),
        unique:         true,
    },
    frameType:{
        type:           String,
        // enum:           ['normal','question']
    },
    lobjID:{
        type:           String,
        required:       true,
        ref:            'lobjs'
    },
    tags:               String,
    draggables:         String,
    order:              Number,
    // courseID:{
    //     type:           String,
    //     required:       true,
    //     ref:            'courses'
    // },
    // chapterID:{
    //     type:           String,
    //     required:       true,
    //     ref:            'chapters'
    // },
    // lessonID:{
    //     type:           String,
    //     required:       true,
    //     ref:            'lessons'
    // },
    // order:{
    //     type:           Number,
    //     min:            0
    // },

    // sticky:[{
    //     sticky:         Boolean,
    //     height:         String,
    // }],

},{
    timestamps:          true,
    toJSON:              {virtuals:true},
});

// frameSchema.virtual('course',{
//     ref:           'courses',
//     localField:    'courseID',
//     foreignField:  'courseID',
//     justOne:        true,
// });
// frameSchema.virtual('chapter',{
//     ref:           'chapters',
//     localField:    'chapterID',
//     foreignField:  'chapterID',
//     justOne:        true,
// });
// frameSchema.virtual('lesson',{
//     ref:           'lessons',
//     localField:    'lessonID',
//     foreignField:  'lessonID',
//     justOne:        true,
// });
frameSchema.virtual('lobj',{
    ref:           'lobjs',
    localField:    'lobjID',
    foreignField:  'lobjID',
    justOne:        true,
});

const   Frame = mongoDB.model('frames',frameSchema,'frames');

exports.Frame = Frame;