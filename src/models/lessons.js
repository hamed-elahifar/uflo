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
    // startDate:{
    //     type:           Date,
    //     default:        Date.now
    // },

},{
    timestamps:          true,
    // toObject:         {virtuals:true},
    toJSON:              {virtuals:true},
});

lessonSchema.index({lessonID:1},{unique:true,background:true});

lessonSchema.methods.duplicate = async function (chapterID) {

    let that = JSON.parse(JSON.stringify(this))

    delete that.id
    delete that._id
    delete that.__v
    delete that.createdAt
    delete that.updatedAt
    delete that.lessonID

    that.chapterID = chapterID
    
    const [err,result] = await tojs(Lesson.create(that))

    if (err) return errorLog(err)

    const lobj = await Lobj.find({lessonID:this.lessonID})
    for (item of lobj){
        await item.duplicate(result.lessonID)
    }

    return result
    
}

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
        .catch(errorLog)

    Frame.deleteMany(this._conditions)
        .then (() => {})
        .catch(errorLog)
        
    next();
});

const   Lesson = mongoDB.model('lessons',lessonSchema,'lessons');

exports.Lesson = Lesson;