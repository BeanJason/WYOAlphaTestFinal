/* Amplify Params - DO NOT EDIT
	API_WHILEYOUREOUT_GRAPHQLAPIIDOUTPUT
	API_WHILEYOUREOUT_JOBTABLE_ARN
	API_WHILEYOUREOUT_JOBTABLE_NAME
	API_WHILEYOUREOUT_USERTABLE_ARN
	API_WHILEYOUREOUT_USERTABLE_NAME
	ENV
	REGION
Amplify Params - DO NOT EDIT */

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  console.log(body.data);
  
  
  // Handle the event
  switch (body.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      console.log('Payment ID is: ' + body.data.object.id);
      console.log('User info is: ' + body.data.object.metadata);
      console.log("PaymentIntent was successful!");
      //Update database
      
      break;
    case "payment_method.attached":
      const paymentMethod = event.data.object;
      console.log("PaymentMethod was attached to a Customer!");
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return {
    statusCode: 200,
    //  Uncomment below to enable CORS requests
    //  headers: {
    //      "Access-Control-Allow-Origin": "*",
    //      "Access-Control-Allow-Headers": "*"
    //  },
    body: JSON.stringify({received: true}),
  };
};
