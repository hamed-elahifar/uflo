
const nodemailer = require("nodemailer");

sendEmail = async (obj) => {
    const { email, body } = obj

    const notify = new Notification({ email, body })
    await notify.save();
}

setInterval(async () => {
    const recipients = await Notification.find({
        email:      {$ne:null},
        status:     {$eq:'pending'},
        attempt:    {$lt:10}
    })

    if (recipients.length > 0) {
        for (recipient of recipients) {
            if (recipient.email && recipient.body) {
                actualSendEmail(recipient.email, recipient.body)
            }
        }
    }
}, 1 * 60 * 1000) // every 1 min

async function actualSendEmail(to, body) {

    let transporter = nodemailer.createTransport(getConfig('nodemailer.transport'));

    transporter.sendMail({
        from: '"Develop1" <Develop1@fedasen.com.au>',   // sender address
        to: to,                                         // list of receivers
        subject: "Your New Password",                   // Subject line
        text: body,                                     // plain text body
        // html:       "<b>Hello world?</b>"            // html body
    })
    .then(info => {
        Notification.findOneAndUpdate({email:to},{$set:{'status':'sent','info':JSON.stringify(info)}})
        .then((result) => {})
    })
    .catch((err) => {
        logger.error(err)
        Notification.findOneAndUpdate({email:to},{$inc:{attempt:1}})
        .then ((result) => {})
        .catch((err)=>{logger.error(err)})
    })
}

module.exports.sendEmail = sendEmail