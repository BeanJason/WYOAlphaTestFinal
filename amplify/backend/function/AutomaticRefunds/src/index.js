/* Amplify Params - DO NOT EDIT
	API_WHILEYOUREOUT_GRAPHQLAPIIDOUTPUT
	API_WHILEYOUREOUT_JOBTABLE_ARN
	API_WHILEYOUREOUT_JOBTABLE_NAME
	API_WHILEYOUREOUT_USERTABLE_ARN
	API_WHILEYOUREOUT_USERTABLE_NAME
	ENV
	FUNCTION_REFUNDPAYMENT_NAME
	FUNCTION_SENDEMAIL_NAME
	REGION
Amplify Params - DO NOT EDIT */

const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient();
const jobTable = process.env.API_WHILEYOUREOUT_JOBTABLE_NAME;
const userTable = process.env.API_WHILEYOUREOUT_USERTABLE_NAME;
const region = process.env.REGION;
AWS.config.update({ region: region });
const lambda = new AWS.Lambda({
  region: region
});

async function getJobs() {
    let params = {
      TableName: jobTable,
      ExpressionAttributeValues: {
        ":currentStatus": "REQUESTED",
      },
      FilterExpression: "currentStatus = :currentStatus",
      ProjectExpression: "id"
    };
    try {
      return await docClient.scan(params).promise();
    } catch (err) {
      return err;
    }
  }

  async function getUser(id) {
    let params = {
      TableName: userTable,
      Key: {
        id: id,
      },
      ExpressionAttributeNames: {
        "#N": "firstName",
        "#E": "email"
      },
      Select: "SPECIFIC_ATTRIBUTES",
      ProjectionExpression: "#N, #E", 
    };
  
    try {
      return await docClient.get(params).promise();
    } catch (err) {
      return err;
    }
  }

  async function sendEmail (job) {
    console.log('sending email')
    if(job.requestOwner){
      let owner = await getUser(job.requestOwner)
      if(owner){
        let total = (job.price + job.tip) / 100;
        total = total.toFixed(2)
        let date = new Date(job.requestDateTime)
        let html = 
          `<html>
              <head>
                  <h1>
                      WYO Job Refund,
                  </h1>
                  <body>
                      <p>
                          Hello ${owner.Item.firstName}
                      </p>
                      <p>
                          This email is sent to inform you that your job request titled ${job.jobTitle} that was scheduled for ${date.toLocaleDateString()}
                          at ${date.toLocaleTimeString()} was unfortunately not accepted by any WYO service provider. You have been
                          issued a full refund of $${total} plus a service fee refund of $2.50. Please try again another time.
                      </p>
                      <p>
                          Your Payment ID: ${job.paymentID}
                      </p>
                      <p>
                          Thank you.
                      </p>
                  </body>
              </head>
          </html>`
        let data = {
          arguments: {
            userEmail: owner.Item.email,
            subject: 'WYO Job Refund',
            message: html
          }
        }
        await lambda.invoke({
          FunctionName: process.env.FUNCTION_SENDEMAIL_NAME,
          InvocationType: "RequestResponse",
          Payload: JSON.stringify(data)
        }).promise()
      }

    }

  }

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (_event) => {
    let {Items} = await getJobs();
    Items = Items.filter(item => item._deleted != true)
    if(Items.length != 0){
      let today = new Date()
      let requestDate , data, res
      for(let job of Items){
        res = {}
        requestDate = new Date(job.requestDateTime)
        data = {arguments: {isCancel: false, jobID: job.id}}
        if(today > requestDate){
          console.log('job will be refunded')
        res = await lambda.invoke({
            FunctionName: process.env.FUNCTION_REFUNDPAYMENT_NAME,
            InvocationType: "RequestResponse",
            Payload: JSON.stringify(data) // pass params
          }).promise()
          //If true send email
          console.log(res.Payload)
          if(res.Payload == true || res.Payload == 'true'){
            await sendEmail(job)
          }
        }
        else if(today.toDateString() == requestDate.toDateString()){
            if( Math.abs((today.getHours() - requestDate.getHours())) <= 4){
              data = {arguments: {isCancel: false, jobID: job.id}}
              res = await lambda.invoke({
              FunctionName: process.env.FUNCTION_REFUNDPAYMENT_NAME,
              InvocationType: "RequestResponse",
              Payload: JSON.stringify(data) // pass params
            }).promise()
            //If true send email
              if(res.Payload == true || res.Payload == 'true'){
                await sendEmail(job)
              }
            }
        }
      }
    }
    return
};
