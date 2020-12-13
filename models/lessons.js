const mongoose      = require('mongoose')
const {mongoDB}     = require('../startup/mongodb');

const {Frame}       = require('./frames');
const {Lobj}        = require('./lobj');

const lessonSchema = new mongoose.Schema({
    
    title:{
        type:           String,
        required:       true
    },
    desc:               String,
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
        default:        () => Math.random().toString(35).substr(2,10),
        unique:         true,
    },
    order:{
        type:           Number,
        min:            0
    },
    startDate:{
        type:           Date,
        default:        Date.now
    },

},{
    timestamps:          true,
    // toObject:         {virtuals:true},
    toJSON:              {virtuals:true},
});

lessonSchema.virtual('course',{
    ref:             'courses',
    localField:      'courseID',
    foreignField:    'courseID',
    justOne:          true,
});
lessonSchema.virtual('chapter',{
    ref:             'chapters',
    localField:      'chapterID',
    foreignField:    'chapterID',
    justOne:          true,
});

lessonSchema.pre('findOneAndDelete', function(next) {

    Lobj.deleteMany(this._conditions)
        .then (() => {})
        .catch(ex => {
            errorLog(ex)
        })
    Frame.deleteMany(this._conditions)
        .then (() => {})
        .catch(ex => {
            errorLog(ex)
        })

    next();
});

const   Lesson = mongoDB.model('lessons',lessonSchema,'lessons');

exports.Lesson = Lesson;