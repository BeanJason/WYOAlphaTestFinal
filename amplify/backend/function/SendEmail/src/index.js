const nodemailer = require('nodemailer')
const client = nodemailer.createTransport({
    service: process.env.SERVICE,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
})
/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {

    if (!event.arguments?.userEmail) {
        throw new Error("User is required");
    }
    if (!event.arguments?.subject) {
    throw new Error("Subject is required");
    }
    if (!event.arguments?.message) {
    throw new Error("Message is required");
    }
    let mail = {
        from: "WYOServices",
        to: event.arguments.userEmail,
        subject: event.arguments.subject,
        html: event.arguments.message
    }
    const response = await new Promise((accept, reject) => {
        client.sendMail(mail, function (err, response) {
            if(err){
                return reject(err)
            }
            else{
                accept('email sent')
            }
        })
    }) 
    
    return JSON.stringify({status: response})

};