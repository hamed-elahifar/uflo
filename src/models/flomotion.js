const mongoose     = require('mongoose');
const {mongoDB}    = require('../startup/mongodb')


const flomotionSchema = new mongoose.Schema({

    flomotiondesmos:    mongoose.Schema.Types.Mixed,
    animation:          String,

},{
    versionKey:         false,
    timestamps:         false,
});

const   Flomotion = mongoDB.model('flomotion',flomotionSchema,'flomotion');

exports.Flomotion = Flomotion;