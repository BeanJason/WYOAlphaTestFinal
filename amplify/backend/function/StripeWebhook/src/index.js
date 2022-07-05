/* Amplify Params - DO NOT EDIT
	API_WHILEYOUREOUT_GRAPHQLAPIIDOUTPUT
	API_WHILEYOUREOUT_JOBTABLE_ARN
	API_WHILEYOUREOUT_JOBTABLE_NAME
	ENV
	REGION
Amplify Params - DO NOT EDIT */

const AWS = require("aws-sdk");
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
      "#P": "price",
      "#T": "tip"
    },
    Select: "SPECIFIC_ATTRIBUTES",
    ProjectionExpression: "#P, #T", 
  };

  try {
    return await docClient.get(params).promise();
  } catch (err) {
    return err;
  }
}

async function updatePaymentID(id, paymentID) {
  let params = {
    TableName: tableName,
    Key: {
      id: id,
    },
    UpdateExpression: "set #paymentID = :newpaymentID",
    ExpressionAttributeNames: {
      "#paymentID": "paymentID",
    },
    ExpressionAttributeValues: {
      ":newpaymentID": paymentID,
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
  const body = JSON.parse(event.body);

  switch (body.type) {
    case "payment_intent.succeeded":
      let jobID = body.data.object.metadata.Job;
      let actualPrice = 0;
      let jobData;

      try {
        jobData = await getItem(jobID);
      } catch (error) {
        console.log(error);
      }
      actualPrice = jobData.Item.price + jobData.Item.tip

      //correct price paid
      if (actualPrice == body.data.object.amount_received) {
        try {
          let res = await updatePaymentID(jobID, body.data.object.id);
          console.log(res);
        } catch (error) {
          console.log(error);
        }
      }
      console.log("PaymentIntent was successful!");
      break;
    case "payment_method.attached":
      console.log("PaymentMethod was attached to a Customer!");
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${body.type}`);
  }

  return {
    statusCode: 200,
    //  Uncomment below to enable CORS requests
    //  headers: {
    //      "Access-Control-Allow-Origin": "*",
    //      "Access-Control-Allow-Headers": "*"
    //  },
    body: JSON.stringify({ received: true }),
  };
};
