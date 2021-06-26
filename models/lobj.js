const mongoose     = require('mongoose')
const {mongoDB}    = require('../startup/mongodb')

  ,   {Frame}      = require('../models/frames')


const lobjSchema = new mongoose.Schema({

    title:{
        type:           String,
        required:       true
    },
    desc:               String,
    lobjID:{
        type:           String,
        default:        () => Math.random().toString(35).substr(2,10),
        unique:         true,
    },
    courseID:{
        type:           String,
        required:       true,
        ref:            'courses'
    },
    chapterID:{
        type:           String,
        required:       true,
        ref:            'chapters'
    },
    lessonID:{
        type:           String,
        required:       true,
        ref:            'lessons'
    },
    order:{
        type:           Number,
        min:            0
    },
    startDate:{
        type:           Date,
        default:        Date.now
    },
    url:                String,

},{
    timestamps:          true,
    toJSON:              {virtuals:true},
});

lobjSchema.virtual('course',{
    ref:           'courses',
    localField:    'courseID',
    foreignField:  'courseID',
    justOne:        true,
});
lobjSchema.virtual('chapter',{
    ref:           'chapters',
    localField:    'chapterID',
    foreignField:  'chapterID',
    justOne:        true,
});
lobjSchema.virtual('lesson',{
    ref:           'lessons',
    localField:    'lessonID',
    foreignField:  'lessonID',
    justOne:        true,
});

lobjSchema.pre('findOneAndDelete', function(next) {
    Frame.deleteMany(this._conditions)
        .then (() => {
            next()
        })
        .catch(ex => {
            errorLog(ex)
            next()
        })
});

const   Lobj = mongoDB.model('lobjs',lobjSchema,'lobjs');

exports.Lobj = Lobj;