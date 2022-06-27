/* Amplify Params - DO NOT EDIT
	API_WHILEYOUREOUT_GRAPHQLAPIIDOUTPUT
	API_WHILEYOUREOUT_JOBTABLE_ARN
	API_WHILEYOUREOUT_JOBTABLE_NAME
	ENV
	REGION
Amplify Params - DO NOT EDIT */

const AWS = require("aws-sdk");
const stripe = require("stripe")("sk_test_51LAbv7GUC6WuR4axUGk966Vt9d0HlrVZ5Ms8z8X96wwhsS84Vbp7ESV19nH7YBBCS2wwZNWMbRvkc9oCd2iJDCEU00yEf71IGp")
const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.API_WHILEYOUREOUT_JOBTABLE_NAME;
const region = process.env.REGION;
AWS.config.update({ region: region });

async function getItem(id) {
  let params = {
    TableName: tableName,
    Key: {
      id: id,
    },
    ExpressionAttributeNames: {
      "#Date": "requestDateTime",
      "#PayID": "paymentID",
      "#Amount": "price",
      "#Status": "currentStatus",
    },
    Select: "SPECIFIC_ATTRIBUTES",
    ProjectionExpression: "#Date, #PayID, #Amount, #Status",
  };
  try {
    return await docClient.get(params).promise();
  } catch (err) {
    return err;
  }
}

async function deleteItem(id) {
  let params = {
    TableName: tableName,
    Key: {
      id: id,
    },
  };
  try {
    await docClient.delete(params).promise();
    return res;
  } catch (err) {
    return err;
  }
}

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
  const { typeName, arguments } = event;
  if (typeName != "Mutation") {
    throw new Error("Request is not a mutation");
  }

  if (arguments?.isCancel == null) {
    throw new Error("Cancellation check is required");
  }
  if (!arguments?.jobID) {
    throw new Error("jobID is required");
  }

  let jobInfo;
  try {
    jobInfo = await getItem(arguments?.jobID);
  } catch (error) {
    console.log(error);
  }
  if (jobInfo) {
    let today = new Date();
    let requestDate = new Date(jobInfo.Item.requestDateTime);
    //if cancelled
    if (arguments.isCancel) {
      if (today.toLocaleDateString() < requestDate.toLocaleDateString()) {
        //refund
        const refund = await stripe.refunds.create({
            payment_intent: jobInfo.Item.paymentID
        })
        if(refund.status == 'succeeded'){
          try {
            await deleteItem(arguments.jobID);
            return true;
          } catch (error) {
            console.log(error);
          }
        }
        return false;
      }
    } else {
      //if not accepted
      if (jobInfo.Item.currentStatus == "REQUESTED") {
        if(today.toLocaleDateString() >= requestDate.toLocaleDateString()){
            //check if two hours or less
            if((today.getHours() - requestDate.getHours()) <= 2){
                //refund
                const refund = await stripe.refunds.create({
                    payment_intent: jobInfo.Item.paymentID
                })
                if(refund.status == 'succeeded'){
                  try {
                    await deleteItem(arguments.jobID);
                    return true;
                  } catch (error) {
                    console.log(error);
                  }
                }
                return false;
            }
        }
      }
    }
  }
  return false;
};
