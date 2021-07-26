const mongoose      = require('mongoose')
const {mongoDB}     = require('../startup/mongodb');

const {Lesson}      = require('./lessons')
const {Lobj}        = require('./lobj')
const {Frame}       = require('./frames')

const chapterSchema = new mongoose.Schema({

    title:{
        type:           String,
        required:       true
    },
    desc:               String,
    startDate:{
        type:           Date,
        default:        Date.now
    },
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

chapterSchema.pre('findOneAndDelete', function(next) {
    Lesson.deleteMany(this._conditions)
        .then (() => {})
        .catch(errorLog)

    Lobj.deleteMany(this._conditions)
        .then (() => {})
        .catch(errorLog)

    Frame.deleteMany(this._conditions)
        .then (() => {})
        .catch(errorLog)
        
    next();

});

const   Chapter = mongoDB.model('chapters',chapterSchema,'chapters');

exports.Chapter = Chapter;