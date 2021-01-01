import * as cdk from '@aws-cdk/core';
import * as ddb from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda';
import * as iam from '@aws-cdk/aws-iam';
import * as tasks from '@aws-cdk/aws-stepfunctions-tasks';
import * as path from 'path';
import { Duration, RemovalPolicy } from '@aws-cdk/core';
import { Chain, StateMachine } from '@aws-cdk/aws-stepfunctions';

export interface LambdaEnvironmentMap {
  [key: string]: any
}

export class SagaStateMachine extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const sampleTable = new ddb.Table(this, 'SageExampleTable', {
      partitionKey: { name: 'TransactionId', type: ddb.AttributeType.STRING },
      tableName: `SagaTransactionTable`,
      readCapacity: 1,
      writeCapacity: 1,
      removalPolicy: RemovalPolicy.DESTROY
    });

    let lambdaEnv: LambdaEnvironmentMap = {};
    lambdaEnv['DYNAMO_TABLE_NAME'] = sampleTable.tableName;

    const startTransactionFunction = new lambda.Function(this, `StartTransactionFunction`, {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset(path.join(__dirname, 'lambda')),
      handler: "start-transaction/index.handler",
      memorySize: 128,
      environment: lambdaEnv,
      timeout: Duration.seconds(5)
    });

    const processRecords = new lambda.Function(this, `ProcessRecords`, {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset(path.join(__dirname, 'lambda')),
      handler: "1-process-records/index.handler",
      memorySize: 128,
      environment: lambdaEnv,
      timeout: Duration.seconds(5)
    });

    const processRecordsRollback = new lambda.Function(this, `ProcessRecords-Rollback`, {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset(path.join(__dirname, 'lambda')),
      handler: "1-process-records-rollback/index.handler",
      memorySize: 128,
      environment: lambdaEnv,
      timeout: Duration.seconds(5)
    });

    processRecords.addToRolePolicy(new iam.PolicyStatement({
      resources: [sampleTable.tableArn],
      actions: ["dynamodb:*"]
    }));

    processRecordsRollback.addToRolePolicy(new iam.PolicyStatement({
      resources: [sampleTable.tableArn],
      actions: ["dynamodb:*"]
    }));

    const transformRecords = new lambda.Function(this, `TransformRecords`, {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset(path.join(__dirname, 'lambda')),
      handler: "2-transform-records/index.handler",
      memorySize: 128,
      environment: lambdaEnv,
      timeout: Duration.seconds(5)
    });

    const transformRecordsRollback = new lambda.Function(this, `TransformRecords-Rollback`, {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset(path.join(__dirname, 'lambda')),
      handler: "2-transform-records-rollback/index.handler",
      memorySize: 128,
      environment: lambdaEnv,
      timeout: Duration.seconds(5)
    });

    transformRecords.addToRolePolicy(new iam.PolicyStatement({
      resources: [sampleTable.tableArn],
      actions: ["dynamodb:*"]
    }));

    transformRecordsRollback.addToRolePolicy(new iam.PolicyStatement({
      resources: [sampleTable.tableArn],
      actions: ["dynamodb:*"]
    }));

    const commitRecords = new lambda.Function(this, `CommitRecords`, {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset(path.join(__dirname, 'lambda')),
      handler: "3-commit-records/index.handler",
      memorySize: 128,
      environment: lambdaEnv,
      timeout: Duration.seconds(5)
    });

    const commitRecordsRollback = new lambda.Function(this, `CommitRecords-Rollback`, {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset(path.join(__dirname, 'lambda')),
      handler: "3-commit-records-rollback/index.handler",
      memorySize: 128,
      environment: lambdaEnv,
      timeout: Duration.seconds(5)
    });

    commitRecords.addToRolePolicy(new iam.PolicyStatement({
      resources: [sampleTable.tableArn],
      actions: ["dynamodb:*"]
    }));

    commitRecordsRollback.addToRolePolicy(new iam.PolicyStatement({
      resources: [sampleTable.tableArn],
      actions: ["dynamodb:*"]
    }));

    const basicFinishTxFunction = new lambda.Function(this, `FinishTransactionFunction`, {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset(path.join(__dirname, 'lambda')),
      handler: "finish-transaction/index.handler",
      memorySize: 128,
      environment: lambdaEnv,
      timeout: Duration.seconds(5)
    });

    startTransactionFunction.addToRolePolicy(new iam.PolicyStatement({
      resources: [sampleTable.tableArn],
      actions: ["dynamodb:*"]
    }));

    basicFinishTxFunction.addToRolePolicy(new iam.PolicyStatement({
      resources: [sampleTable.tableArn],
      actions: ["dynamodb:*"]
    }));

    const startFunctionTask = new tasks.LambdaInvoke(this, 'StartTransaction', {
      lambdaFunction: startTransactionFunction,
      inputPath: '$.Payload',
      outputPath: '$',
    });

    const anotherFunctionTask = new tasks.LambdaInvoke(this, 'FinishTransaction', {
      lambdaFunction: basicFinishTxFunction,
      inputPath: '$[0].Payload',
      outputPath: '$',
    });

    const processRecordsTask = new tasks.LambdaInvoke(this, 'ProcessRecordsTask', {
      lambdaFunction: processRecords,
      inputPath: '$.Payload',
      outputPath: '$',
    });

    const processRecordsRollbackTask = new tasks.LambdaInvoke(this, 'ProcessRecordsRollbackTask', {
      lambdaFunction: processRecordsRollback,
      inputPath: '$',
      outputPath: '$',
    });

    const transformRecordsTask = new tasks.LambdaInvoke(this, 'TransformRecordsTask', {
      lambdaFunction: transformRecords,
      inputPath: '$[0].Payload',
      outputPath: '$',
    });

    const transformRecordsRollbackTask = new tasks.LambdaInvoke(this, 'TransformRecordsRollbackTask', {
      lambdaFunction: transformRecordsRollback,
      inputPath: '$',
      outputPath: '$',
    });

    const commitRecordsTask = new tasks.LambdaInvoke(this, 'CommitRecordsTask', {
      lambdaFunction: commitRecords,
      inputPath: '$[0].Payload',
      outputPath: '$',
    });

    const commitRecordsRollbackTask = new tasks.LambdaInvoke(this, 'CommitRecordsRollbackTask', {
      lambdaFunction: commitRecordsRollback,
      inputPath: '$',
      outputPath: '$',
    });
    
    const processRecordChain = Chain.start(processRecordsTask)
      .toSingleState('ProcessRecordsGroup')
      .addCatch(processRecordsRollbackTask, { resultPath: "$.error" });

    const rollbackFromTransformChain = Chain.start(transformRecordsRollbackTask).next(processRecordsRollbackTask);

    const transforRecordChain = Chain.start(transformRecordsTask)
      .toSingleState('TransformRecordsGroup')
      .addCatch(rollbackFromTransformChain, { resultPath: "$[0].error" });

    const rollbackFromCommitChain = Chain.start(commitRecordsRollbackTask).next(rollbackFromTransformChain);

    const commitRecordChain = Chain.start(commitRecordsTask)
      .toSingleState('CommitRecordsGroup')
      .addCatch(rollbackFromCommitChain, { resultPath: "$[0].error" });

    const definitionChain = Chain.start(startFunctionTask)
      .next(processRecordChain)
      .next(transforRecordChain)
      .next(commitRecordChain)
      .next(anotherFunctionTask);

    new StateMachine(this, 'SagaStateMachineExample', {
      timeout: Duration.minutes(5),
      stateMachineName: 'SagaStateMachineExample',
      definition: definitionChain
    });
  }
}

