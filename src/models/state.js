const mongoose     = require('mongoose');
const {mongoDB}    = require('../startup/mongodb')


const stateSchema = new mongoose.Schema({

    stateID:{
        type:           String,
        default:        () => Math.random().toString(35).substr(2,6),
        unique:         true,
    },
    canvasID:{
        type:           String,
        required:       true,
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
        desmosID:{
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

stateSchema.virtual('canvas',{
    ref:            'canvas',
    localField:     'canvasID',
    foreignField:   'canvasID',
    justOne:         true,
});
stateSchema.virtual('lobj',{
    ref:            'lobjs',
    localField:     'lobjID',
    foreignField:   'lobjID',
    justOne:         true,
});

const   State = mongoDB.model('states',stateSchema,'states');

exports.State = State;