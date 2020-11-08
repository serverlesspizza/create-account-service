#!/bin/bash

aws cloudformation update-stack --stack-name 'serverlesspizza-create-account-lambda-pipeline' \
	--template-body file://cfn_codepipeline.yml \
	--region eu-west-1 \
	--parameters ParameterKey=GitHubToken,ParameterValue=$AWS_GITHUB_TOKEN \
		ParameterKey=ModuleName,ParameterValue=create-account-service \
	--capabilities CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND \
	--profile aws-serverlesspizza-devops
