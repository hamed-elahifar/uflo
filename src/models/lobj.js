const mongoose     = require('mongoose')
const {mongoDB}    = require('../startup/mongodb')

  ,   {Frame}      = require('../models/frames')
  ,   {Canvas}     = require('../models/canvas')


const lobjSchema = new mongoose.Schema({

    name:{
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
    frames:{
        type:           Array,
        of:             Number,
        ref:            'frames'
    },
    code:               String,

},{
    timestamps:          true,
    toJSON:              {virtuals:true},
});

lobjSchema.index({lobjID:1},{unique:true,background:true});

lobjSchema.methods.duplicate = async function (lessonID) {

    let that = JSON.parse(JSON.stringify(this))

    delete that.id
    delete that._id
    delete that.__v
    delete that.createdAt
    delete that.updatedAt
    delete that.lobjID

    that.lessonID = lessonID
    
    const [err,result] = await tojs(Lobj.create(that))

    if (err) return errorLog(err)

    const canvas = await Canvas.find({lobjID:this.lobjID})
    for (item of canvas){
        await item.duplicate(result.lobjID)
    }

    const frames = await Frame.find({lobjID:this.lobjID})
    for (item of frames){
        await item.duplicate(result.lobjID)
    }

    return result
    
}

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
lobjSchema.virtual('framesArray',{
    ref:           'frames',
    localField:    'frames',
    foreignField:  'frameID',
    justOne:        true,
});

lobjSchema.pre('findOneAndDelete', function(next) {
    Frame.deleteMany(this._conditions)
        .then (() => {})
        .catch(errorLog)

    next()
});

const   Lobj = mongoDB.model('lobjs',lobjSchema,'lobjs');

exports.Lobj = Lobj;