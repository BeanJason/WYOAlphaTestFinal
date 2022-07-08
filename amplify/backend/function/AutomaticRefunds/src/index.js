/* Amplify Params - DO NOT EDIT
	API_WHILEYOUREOUT_GRAPHQLAPIIDOUTPUT
	API_WHILEYOUREOUT_JOBTABLE_ARN
	API_WHILEYOUREOUT_JOBTABLE_NAME
	ENV
	FUNCTION_REFUNDPAYMENT_NAME
	REGION
Amplify Params - DO NOT EDIT */

const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.API_WHILEYOUREOUT_JOBTABLE_NAME;
const region = process.env.REGION;
AWS.config.update({ region: region });
const lambda = new AWS.Lambda({
  region: region
});

async function getJobs() {
    let params = {
      TableName: tableName,
      ExpressionAttributeValues: {
        ":currentStatus": "REQUESTED"
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

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
    let {Items} = await getJobs();
    if(Items.length != 0){
      let today = new Date()
      let requestDate
      let data
      let res
      for(let job of Items){
        res = {}
        requestDate = new Date(job.requestDateTime)
        data = {arguments: {isCancel: false, jobID: job.id}}
        if(today > requestDate){
         res = await lambda.invoke({
            FunctionName: process.env.FUNCTION_REFUNDPAYMENT_NAME,
            InvocationType: "RequestResponse",
            Payload: JSON.stringify(data) // pass params
          }).promise()
          //If true send notification
          console.log(res.Payload)
        }
        else if(today.toLocaleDateString() == requestDate.toLocaleDateString()){
            if( Math.abs((today.getHours() - requestDate.getHours())) <= 2){
              res = await lambda.invoke({
              FunctionName: process.env.FUNCTION_REFUNDPAYMENT_NAME,
              InvocationType: "RequestResponse",
              Payload: JSON.stringify(data) // pass params
            }).promise()
            //If true send notification
            console.log(res.Payload)
            }
        }
      }
    }
    return
};
