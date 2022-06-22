const stripe = require('stripe')('sk_test_51LAbv7GUC6WuR4axUGk966Vt9d0HlrVZ5Ms8z8X96wwhsS84Vbp7ESV19nH7YBBCS2wwZNWMbRvkc9oCd2iJDCEU00yEf71IGp')

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
    const { typeName, arguments } = event;

    if (typeName != 'Mutation') {
        throw new Error('Request is not a mutation')
    }

    if (!arguments.duration) {
        throw new Error('Duration is required')
    }
    //Calculate price
    let amount = 200;


    //create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        metadata: {
            User: arguments.userID,
            Email: arguments.email, 
            Job: arguments.jobID
        }
    })

    console.log(paymentIntent);
    return {
        clientSecret: paymentIntent.client_secret,
        amount: amount
    }

};
