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
    startDate:{
        type:           Date,
        default:        Date.now
    },
    endDate:{
        type:           Date,
        default:        Date.now
    },

},{
    timestamps:         true,
    // toObject:           {virtuals:true},
    toJSON:             {virtuals:true},
});

chapterSchema.index({chapterID:1},{unique:true,background:true});

chapterSchema.methods.duplicate = async function (courseID) {

    let that = JSON.parse(JSON.stringify(this))

    delete that.id
    delete that._id
    delete that.__v
    delete that.createdAt
    delete that.updatedAt
    delete that.chapterID

    that.courseID = courseID
    
    const [err,result] = await tojs(Chapter.create(that))

    if (err) return errorLog(err)

    const lesson = await Lesson.find({chapterID:this.chapterID})
    for (item of lesson){
        await item.duplicate(result.chapterID)
    }

    return result
    
}


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