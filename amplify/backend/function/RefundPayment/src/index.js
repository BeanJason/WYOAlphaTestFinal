/* Amplify Params - DO NOT EDIT
	API_WHILEYOUREOUT_GRAPHQLAPIIDOUTPUT
	API_WHILEYOUREOUT_JOBTABLE_ARN
	API_WHILEYOUREOUT_JOBTABLE_NAME
	ENV
	REGION
Amplify Params - DO NOT EDIT */

const AWS = require("aws-sdk");
const stripe = require("stripe")(process.env.STRIPE_KEY)
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
      "#Amount": "price",
      "#PayID": "paymentID",
      "#Status": "currentStatus",
      "#Date": "requestDateTime"
    },
    Select: "SPECIFIC_ATTRIBUTES",
    ProjectionExpression: "#Amount, #PayID, #Status, #Date",
  };
  try {
    return await docClient.get(params).promise();
  } catch (err) {
    return err;
  }
}

async function updateJob(id, date) {
  let params = {
    TableName: tableName,
    Key: {
      id: id,
    },
    UpdateExpression: "set #markedToRemove = :markedToRemove",
    ExpressionAttributeNames: {
      "#markedToRemove": "markedToRemove",
    },
    ExpressionAttributeValues: {
      ":markedToRemove": date,
    },
  };

  try {
    return await docClient.update(params).promise();
  } catch (err) {
    return err;
  }
}

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
  const { arguments } = event;
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
  console.log(jobInfo);
  if (jobInfo) {
    //if cancelled
    if (arguments.isCancel == true) {
        //refund
        let amount = jobInfo.Item.price - 250;
        const refund = await stripe.refunds.create({
            payment_intent: jobInfo.Item.paymentID,
            amount: amount
        })
        if(refund.status == 'succeeded'){
          try {
            let date = new Date(jobInfo.Item.requestDateTime)
            date.setDate(date.getDate() - 2)
            await updateJob(arguments.jobID, date.toString());
            return true;
          } catch (error) {
            console.log(error);
          }
        }
        return false;
    } else {
      //if not accepted
      console.log('auto-refund')
      if (jobInfo.Item.currentStatus == "REQUESTED") {
          //refund
          const refund = await stripe.refunds.create({
              payment_intent: jobInfo.Item.paymentID,
          })
          if(refund.status == 'succeeded'){
            try {
              let date = new Date(jobInfo.Item.requestDateTime)
              date.setDate(date.getDate() - 2)
              await updateJob(arguments.jobID, date.toString());
              return true;
            } catch (error) {
              console.log(error);
            }
          }
          return false;
      }
    }
  }
  return false;
};
