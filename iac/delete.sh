#!/bin/bash

aws cloudformation delete-stack 
    --stack-name 'serverlesspizza-create-account-lambda-pipeline' 
    --region eu-west-1
    --profile aws-serverlesspizza-devops
