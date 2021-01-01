# Saga Pattern with AWS CDK and Step Functions

This is an example of the Saga Pattern using AWS Step Functions with Lambda, and AWS CDK for defining the Saga pattern step function state machine and flow.

This CDK app consists of a bunch of simple, example lambda functions that define an imaginery transaction / flow, where a set of records are written to a DynamoDB table with the following steps process:

* Process
* Transform
* Commit

There are 3 x main lambda functions, one for each of the above, and a paired 'rollback' function for each of these in case of failure.

In the event of a failure at a certain point in the transaction, the rollback step for that function will run, followed by the rollback functions for any other steps in the transaction that had already run.

See: [Blog post discussing Saga Pattern and this aws-cdk app here](https://www.shogan.co.uk/aws/saga-pattern-with-aws-cdk-lambda-and-step-functions/).

## Building locally

There is no top-level npm script to build all the lib/lambda function modules, so remember to `tsc` and `npm install` for each of those if you wish work with the functions locally. You'll need to do this in the lib/lambda/common directory first, as this is a dependency of each lambda function.

Otherwise, a `cdk deploy` after a `npm run build` should be fine to deploy everything as the lambda runtime environment will already contain the npm dependencies (aws-sdk).

Note: CDK deploy will fail if you have run npm install locally for all lambda functions due to the asset package size limit with all node_modules directories in each. There is a better way to deploy all of this and package up the lambda handlers, but for this quick example repository, this is how I've done it.

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template

