#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { SagaStateMachine } from '../lib/saga-state-machine-stack';

const app = new cdk.App();
new SagaStateMachine(app, 'SagaStateMachineExample', { env: { region: "eu-west-1" }});
