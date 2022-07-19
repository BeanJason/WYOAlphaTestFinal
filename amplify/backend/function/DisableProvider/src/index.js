/* Amplify Params - DO NOT EDIT
	API_WHILEYOUREOUT_GRAPHQLAPIIDOUTPUT
	API_WHILEYOUREOUT_MANAGERTABLE_ARN
	API_WHILEYOUREOUT_MANAGERTABLE_NAME
	AUTH_WHILEYOUREOUT_USERPOOLID
	ENV
	REGION
Amplify Params - DO NOT EDIT */

const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient();
const userTable = process.env.API_WHILEYOUREOUT_MANAGERTABLE_NAME;
const poolID = process.env.AUTH_WHILEYOUREOUT_USERPOOLID;
const cognito = new AWS.CognitoIdentityServiceProvider({
    apiVersion: "2016-04-18",
});
const region = process.env.REGION;
AWS.config.update({ region: region });

async function getUser(id) {
    let params = {
      TableName: userTable,
      Key: {
        id: id,
      },
      ExpressionAttributeNames: {
        "#E": "email"
      },
      Select: "SPECIFIC_ATTRIBUTES",
      ProjectionExpression: "#E", 
    };
  
    try {
      return await docClient.get(params).promise();
    } catch (err) {
      return err;
    }
  }

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
    if(event.arguments?.manager){
        throw new Error("Manager is required");
    }
    if(event.arguments?.userSub){
        throw new Error("User sub ID is required");
    }
    if(event.arguments?.email){
        throw new Error("User email is required");
    }
    let manager = await getUser(event.arguments.manager)
    if(!manager){
        throw new Error("Not authorized to disable users");
    }
    else{
        let params = {
            UserPoolId: poolID,
            Username: event.arguments.userSub
        }
        cognito.adminDisableUser(params, function(err, data){
            if(err){
                console.log(err);
                return 'Failed'
            }
            else{
                console.log('success');
                console.log(data);
                return 'Success'
            }
        })
    }
};
