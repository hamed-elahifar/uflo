const { toUpper } = require('lodash');
const mongoose      = require('mongoose')
const {mongoDB}     = require('../startup/mongodb')

const chapterSchema = new mongoose.Schema({

    name:               String,
    title:{
        type:           String,
        required:       true
    },

    startDate:          Date,

    order:              Number,
    courseID:{
        type:           String,
        required:       true,
        ref:            'courses'
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