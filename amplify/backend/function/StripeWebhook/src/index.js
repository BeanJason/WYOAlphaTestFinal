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
      "#D": "duration",
    },
    Select: "SPECIFIC_ATTRIBUTES",
    ProjectionExpression: "#D",
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
      let actualPrice = 2000;
      let jobData;

      try {
        jobData = await getItem(jobID);
      } catch (error) {
        console.log(error);
      }

      switch (jobData.Item.duration) {
        case 4:
          actualPrice = 2000;
          break;
        case 5:
          actualPrice = 3000;
          break;
        case 6:
          actualPrice = 4000;
          break;
        case 7:
          actualPrice = 5000;
          break;
        case 8:
          actualPrice = 6000;
          break;
      }

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
