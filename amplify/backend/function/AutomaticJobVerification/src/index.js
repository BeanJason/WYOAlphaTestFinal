/* Amplify Params - DO NOT EDIT
	API_WHILEYOUREOUT_CODETABLE_ARN
	API_WHILEYOUREOUT_CODETABLE_NAME
	API_WHILEYOUREOUT_GRAPHQLAPIIDOUTPUT
	API_WHILEYOUREOUT_JOBTABLE_ARN
	API_WHILEYOUREOUT_JOBTABLE_NAME
	API_WHILEYOUREOUT_PROVIDERTABLE_ARN
	API_WHILEYOUREOUT_PROVIDERTABLE_NAME
	ENV
	FUNCTION_SENDEMAIL_NAME
	REGION
Amplify Params - DO NOT EDIT */

const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient();
const jobTable = process.env.API_WHILEYOUREOUT_JOBTABLE_NAME;
const providerTable = process.env.API_WHILEYOUREOUT_PROVIDERTABLE_NAME;
const codeTable = process.env.API_WHILEYOUREOUT_CODETABLE_NAME;
const region = process.env.REGION;
AWS.config.update({ region: region });
const lambda = new AWS.Lambda({
  region: region
});

async function getJobs() {
    let params = {
      TableName: jobTable,
      ExpressionAttributeValues: {
        ":currentStatus": "ACCEPTED",
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

  async function updateJobStatus(id) {
    let params = {
      TableName: jobTable,
      Key: {
        id: id,
      },
      UpdateExpression: "set #currentStatus = :currentStatus",
      ExpressionAttributeNames: {
        "#currentStatus": "currentStatus",
      },
      ExpressionAttributeValues: {
        ":currentStatus": 'FAILED',
      },
    };
  
    try {
      return await docClient.update(params).promise();
    } catch (err) {
      return err;
    }
  }



  async function getProvider(id) {
    let params = {
      TableName: providerTable,
      Key: {
        id: id,
      },
      ExpressionAttributeNames: {
        "#N": "firstName",
        "#E": "email",
        "#O": "offenses"
      },
      Select: "SPECIFIC_ATTRIBUTES",
      ProjectionExpression: "#N, #E, #O", 
    };
  
    try {
      return await docClient.get(params).promise();
    } catch (err) {
      return err;
    }
  }

  async function updateProviderOffenses(id, count) {
    let params = {
      TableName: providerTable,
      Key: {
        id: id,
      },
      UpdateExpression: "set #offenses = :offenses",
      ExpressionAttributeNames: {
        "#offenses": "offenses",
      },
      ExpressionAttributeValues: {
        ":offenses": count,
      },
    };
    try {
      return await docClient.update(params).promise();
    } catch (err) {
      return err;
    }
  }

  async function updateProviderBan(id) {
    let params = {
      TableName: providerTable,
      Key: {
        id: id,
      },
      UpdateExpression: "set #isBan = :isBan",
      ExpressionAttributeNames: {
        "#isBan": "isBan",
      },
      ExpressionAttributeValues: {
        ":isBan": true,
      },
    };
    try {
        return await docClient.update(params).promise();
      } catch (err) {
        return err;
      }
    }



  async function getZipCode(code) {
    let params = {
      TableName: codeTable,
      ExpressionAttributeValues: {
        ":zipCode": code,
      },
      FilterExpression: "zipCode = :zipCode",
      ProjectExpression: "id"
    };
    try {
      return await docClient.scan(params).promise();
    } catch (err) {
      return err;
    }
  }
    
  async function updateZipCode(id, count) {
    let params = {
      TableName: codeTable,
      Key: {
        id: id,
      },
      UpdateExpression: "set #count = :count",
      ExpressionAttributeNames: {
        "#count": "count",
      },
      ExpressionAttributeValues: {
        ":count": count,
      },
    };
    try {
        return await docClient.update(params).promise();
      } catch (err) {
        return err;
      }
    }

  async function sendEmail (job, provider) {
    if(job.requestOwner){
      if(provider){
        let date = new Date(job.requestDateTime)
        let html = 
          `<html>
              <head>
                  <h1>
                      WYO Job Failure,
                  </h1>
                  <body>
                      <p>
                          Hello ${provider.Item.firstName}
                      </p>
                      <p>
                          This email is sent to inform you about your accepted job request titled ${job.jobTitle}. This job was 
                          scheduled for ${date.toLocaleDateString()}. You have failed to check into the job in which you are the main 
                          provider and as a result, you have received an offense. If there were special circumstances or you think 
                          this is a mistake, please contact us.
                      </p>
                      <p>
                          Thank you.
                      </p>
                  </body>
              </head>
          </html>`
        let data = {
          arguments: {
            userEmail: provider.Item.email,
            subject: 'WYO Job',
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
exports.handler = async (event) => {
    let {Items} = await getJobs();
    Items = Items.filter(item => item._deleted != true && !item.checkInTime)
    if(Items.length !== 0){
        let today = new Date()
        let requestDate , providerData, res, count, zipCode
        for(let job of Items){
            res = {}
            requestDate = new Date(job.requestDateTime)
            if(today.toDateString() == requestDate.toDateString() && today.getHours() > requestDate.getHours()){
              console.log('updating job status')
                await updateJobStatus(job.id)
                //update zip
                zipCode = await getZipCode(job.zipCode)
                zipCode =  zipCode.Items.filter(item => item._deleted != true)
                count = zipCode[0].count
                count -= 1
                if(count < 0){
                  count = 0
                }
                await updateZipCode(zipCode[0].id, count)
                //update provider
                providerData = await getProvider(job.mainProvider)
                console.log('updating provider: ' + providerData)
                count = providerData.Item.offenses
                count += 1
                await updateProviderOffenses(job.mainProvider, count)
                if(count >= 2){
                    await updateProviderBan(job.mainProvider)
                }
                await sendEmail(job, providerData)
            }
            else if(today > requestDate){
              console.log('updating job status')
                await updateJobStatus(job.id)
                //update zip
                zipCode = await getZipCode(job.zipCode)
                zipCode =  zipCode.Items.filter(item => item._deleted != true)
                count = zipCode[0].count
                count -= 1
                if(count < 0){
                  count = 0
                }
                await updateZipCode(zipCode[0].id, count)
                //update provider
                providerData = await getProvider(job.mainProvider)
                console.log('updating provider: ' + providerData)
                count = providerData.Item.offenses
                count += 1
                await updateProviderOffenses(job.mainProvider, count)
                if(count >= 2){
                    await updateProviderBan(job.mainProvider)
                }
                await sendEmail(job, providerData)
            }
        }
    }
};
