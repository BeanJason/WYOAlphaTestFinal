/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/


/* Amplify Params - DO NOT EDIT
	API_WHILEYOUREOUT_GRAPHQLAPIIDOUTPUT
	API_WHILEYOUREOUT_JOBTABLE_ARN
	API_WHILEYOUREOUT_JOBTABLE_NAME
	ENV
	REGION
Amplify Params - DO NOT EDIT */

const express = require('express')
const bodyParser = require('body-parser')
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const stripe = require('stripe')(process.env.STRIPE_KEY)

// declare a new express app
const app = express()
app.use(express.json({verify: (req,res,buf) => { req.rawBody = buf }}));
app.use(express.json({limit: '10mb'}))
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "*")
  next()
});

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


app.post('/stripeWebhook', async function(req, res) {
  // Add your code here
  const sig = req.headers['stripe-signature'];
  let event
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.WEBHOOK_KEY);
  } catch (error) {
    res.status(400).json({message: error.message})
  }
  switch(event.type){
    case "payment_intent.succeeded":
      let jobID = event.data.object.metadata.Job;
      let actualPrice = 0;
      let jobData;

      try {
        jobData = await getItem(jobID);
      } catch (error) {
        console.log(error);
      }
      actualPrice = jobData.Item.price + jobData.Item.tip

      //correct price paid
      if (actualPrice == event.data.object.amount_received) {
        try {
          console.log('update payment id')
          await updatePaymentID(jobID, event.data.object.id);
        } catch (error) {
          console.log(error);
        }
      }
      console.log("PaymentIntent was successful!");
      break;
    case "payment_method.attached":
      console.log("PaymentMethod was attached to a Customer!");
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
    res.json({received: true})
});


app.listen(3000, function() {
    console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app
