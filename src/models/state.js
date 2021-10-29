const mongoose     = require('mongoose');
const {mongoDB}    = require('../startup/mongodb')


const stateSchema = new mongoose.Schema({

    stateID:{
        type:           String,
        default:        () => Math.random().toString(35).substr(2,6),
        unique:         true,
    },
    canvasIDs:{
        type:           Array,
        of:             String,
        ref:            'canvas'
    },
    lobjID:{
        type:           String,
        required:       true,
        ref:            'lobjs'
    },
    startFrame:         String,
    endFrame:           String,
    type:{
        type:           String,
        enum:           ['enter','inview']
    },
    transformation:[{
        desmosId:{
            type:       String,
            required:   true
        },
        compId:{
            type:       String,
            required:   true
        },
        attribute:      String,
        value:          String,
        latex:          String,
        expidx:         String,
        sliderBounds:{
            min:        String,
            max:        String,
            step:       String,
        },
        customAttr:     String,
        customTrans:    String,
    }]

},{
    timestamps:          true,
    toJSON:              {virtuals:true},
});

stateSchema.index({stateID:1},{unique:true,background:true});

stateSchema.virtual('canvas',{
    ref:            'canvas',
    localField:     'canvasIDs',
    foreignField:   'canvasID',
    // justOne:         true,
});
stateSchema.virtual('lobj',{
    ref:            'lobjs',
    localField:     'lobjID',
    foreignField:   'lobjID',
    justOne:         true,
});

const   State = mongoDB.model('states',stateSchema,'states');

exports.State = State;