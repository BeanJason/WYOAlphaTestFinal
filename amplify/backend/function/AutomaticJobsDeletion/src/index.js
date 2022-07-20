/* Amplify Params - DO NOT EDIT
	API_WHILEYOUREOUT_GRAPHQLAPIIDOUTPUT
	API_WHILEYOUREOUT_JOBTABLE_ARN
	API_WHILEYOUREOUT_JOBTABLE_NAME
	ENV
	REGION
Amplify Params - DO NOT EDIT */

const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient();
const jobTable = process.env.API_WHILEYOUREOUT_JOBTABLE_NAME;
const region = process.env.REGION;
AWS.config.update({ region: region });

async function getJobs() {
    let params = {
      TableName: jobTable,
      ExpressionAttributeValues: {
        ":check": "COMPLETED",
      },
      FilterExpression: "currentStatus <> :check",
    };
    try {
      return await docClient.scan(params).promise();
    } catch (err) {
      return err;
    }
  }

  async function deleteItem(id) {
    let params = {
      TableName: jobTable,
      Key: {
        id: id,
      },
    };
    try {
      await docClient.delete(params).promise();
    } catch (err) {
      return err;
    }
  }

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
    let {Items} = await getJobs();
    Items = Items.filter(item => item._deleted != true && item.markedToRemove)
    if(Items.length != 0){
        let today = new Date()
        let requestDate
        for(let job of Items){
            requestDate = new Date(job.markedToRemove)
            if(today.toDateString() == requestDate.toDateString()){
                await deleteItem(job.id)
            }
        }
    }
    return
};
