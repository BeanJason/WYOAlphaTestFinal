const aws = require('aws-sdk')
aws.config.update({region: process.env.REGION});
const ses = new aws.SES()


/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
    if(!event.arguments.name){
        throw new Error('Name is required')
    }
    if(!event.arguments.email){
        throw new Error('Email is required')
    }
    if(!event.arguments.message){
        throw new Error('message is required')
    }

    // Create sendEmail params 
let params = {
    Destination: { 
      ToAddresses: [
        process.env.SES_EMAIL
      ]
    },
    Message: { 
      Body: { 
        Html: {
         Data: 
        `<html>
            <head>
                <h1>
                    Contact Name: ${event.arguments.name},
                </h1>
                <body>
                    <p>
                        Message:
                    </p>
                    <p>
                        ${event.arguments.message}
                    </p>
                    <p>
                        The contact email: ${event.arguments.email}
                    </p>
                </body>
            </head>
        </html>`
        }
       },
       Subject: {
        Data: 'WYO Contact Us'
       }
      },
    Source: process.env.SES_EMAIL, 
  };

  // Create the promise and SES service object
let sendPromise = ses.sendEmail(params).promise();

await sendPromise.then(
    function() {
        return 'Successful'
    }).catch(
        function(err){
            console.log(err);
            return 'failed'
        }
    )
   
};
