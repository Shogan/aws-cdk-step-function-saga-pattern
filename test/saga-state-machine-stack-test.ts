import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as ssmApp from '../lib/saga-state-machine-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new ssmApp.SagaStateMachine(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
