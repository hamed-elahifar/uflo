const Sequelize     = require('sequelize')
const {DB}          = require('../startup/sequelize')


const Analytics     = DB.define('Analytics',{

    userID:             Sequelize.STRING,
    frameID:            Sequelize.STRING,
    courseID:           Sequelize.STRING,
    chapterID:          Sequelize.STRING,
    lessonID:           Sequelize.STRING,
    lobjID:             Sequelize.STRING,
    startDate:          Sequelize.DATE,
    duration:           Sequelize.INTEGER,

},{
    timestamps:         true,
    paranoid:           false,
    underscored:        false,
    freezeTableName:    true,
    tableName:          'Analytics'
});

Analytics.sync({force:true}).catch(errorLog)

// // force: true will drop the table if it already exists
// Analytics.sync({force: false}).then(() => {
// //  // Table created
//     return Analytics.create({
//         user_id:            '123',
//         address:            '123',
//         private_key:        '123',
//         public_key:         '123',
//         amount:             '123',
//         coin_symbol:        'BTC',
//         pendding_amount:    '123',
//         blocked_amount:     '123',
//         last_check_date:    '123',
//         is_blocked:         false,
//         operator_id:        '123',
//         reason_id:          '123',
//     })
// })
// .catch((err)=>{
//     console.log('inja...')
//     console.log(err)
// })

module.exports.Analytics  = Analytics

// const analyticSchema = new mongoose.Schema({

//     userID:{
//         type:           String,
//         ref:            'users'
//     },
//     frameID:{
//         type:           String,
//         ref:            'frames'
//     },
//     startDate:{
//         type:           Date,
//         default:        Date.now
//     },
//     duration:           Number,

// },{
//     timestamps:         true,
//     toJSON:             {virtuals:true},
// });

// analyticSchema.virtual('user',{
//     ref:           'users',
//     localField:    'userID',
//     foreignField:  'userID',
//     justOne:        true,
// });
// analyticSchema.virtual('frame',{
//     ref:           'frames',
//     localField:    'frameID',
//     foreignField:  'frameID',
//     justOne:        true,
// });

// const   Analytic = mongoDB.model('analytics',analyticSchema,'analytics');

// exports.Analytic = Analytic;