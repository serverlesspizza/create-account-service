const AWS = require('aws-sdk');

const environment = process.env.ENVIRONMENT;
const region = process.env.REGION;
const tableName = `${environment}-account`;
const userPoolId = process.env.USER_POOL_ID;

AWS.config.update({region: region});

const sqs = new AWS.SQS({apiVersion: '2012-11-05'});
const cog = new AWS.CognitoIdentityServiceProvider();
const ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

exports.handler = function (event, context, callback) {
	event.Records.map(function(record) {
		var email = JSON.parse(record.body).email;
		Promise.resolve(getUsername(email))
			.then(function(data) {
				createAccountForUser(data.Username, email);
			});
	});

	callback(null, event);
};

function getUsername(email) {
	var params = {
		UserPoolId: userPoolId,
		Username: email
	};

	return new Promise(function(resolve, reject) {
		cog.adminGetUser(params, function (err, data) {
			if (err) {
				console.log(err, err.stack);
				return reject(err);
			} else {
				return resolve(data);
			}
		});
	});
}

function userHasAccount(username) {
	var params = {
		TableName: tableName,
		Key: {
			'accountId': {S: username}
		}
	};

	return new Promise(function(resolve, reject) {
		ddb.getItem(params, function(err, data) {
			if (err) {
				console.log("err: ", err);
				return reject(err);
			} else {
				return resolve(data);
			}
		});
	});
}

function createAccountForUser(username, email) {
	Promise.resolve(userHasAccount(username))
		.then(function(data) {
			if (!Object.keys(data).length) {
				var params = {
					TableName: tableName,
					Item: {
						'accountId' : {S: username},
						'email' : {S: email},
						// Hard code address and payment details here as we will not allow users to potentially store personal information in the database
						'address': {
							M: {
								'county': {S: 'Northamptonshire'},
								'numberOrName': {S: '1'},
								'postCode': {S: 'NN1 1AB'},
								'street': {S: 'High Street'}
							}
						},
						'payment': {
							M: {
								'name': {S: 'Debit card'},
								'number': {S: '4643 5634 5634 5645'}
							}
						}
					}
				};

				ddb.putItem(params, function(err, data) {
					if (err) {
						console.log("Error", err);
					}
				});
			}
		});
}
