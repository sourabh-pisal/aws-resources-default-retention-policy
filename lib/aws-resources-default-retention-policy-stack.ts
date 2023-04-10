import {Duration, Fn, Stack, StackProps} from 'aws-cdk-lib';
import {Rule, Schedule} from 'aws-cdk-lib/aws-events';
import {LambdaFunction} from 'aws-cdk-lib/aws-events-targets';
import {Policy, PolicyStatement} from 'aws-cdk-lib/aws-iam';
import {
  Architecture,
  Code,
  CodeSigningConfig,
  Function,
  Runtime,
} from 'aws-cdk-lib/aws-lambda';
import {SnsDestination} from 'aws-cdk-lib/aws-lambda-destinations';
import {Platform, SigningProfile} from 'aws-cdk-lib/aws-signer';
import {Topic} from 'aws-cdk-lib/aws-sns';
import {EmailSubscription} from 'aws-cdk-lib/aws-sns-subscriptions';
import {Construct} from 'constructs';
import path = require('path');

export class AwsResourcesDefaultRetentionPolicyStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const signingProfile = new SigningProfile(this, 'SigningProfile', {
      platform: Platform.AWS_LAMBDA_SHA384_ECDSA,
    });

    const codeSigningConfig = new CodeSigningConfig(this, 'CodeSigningConfig', {
      signingProfiles: [signingProfile],
    });

    const logGroupRetentionPolicyUpdaterFailureTopic = new Topic(
      this,
      'LogGroupRetentionPolicyUpdaterFailureTopic'
    );
    logGroupRetentionPolicyUpdaterFailureTopic.addSubscription(
      new EmailSubscription('{{resolve:ssm:email}}')
    );

    const logGroupRetentionPolicyUpdater = new Function(
      this,
      'LogGroupRetentionPolicyUpdater',
      {
        codeSigningConfig,
        runtime: Runtime.NODEJS_18_X,
        architecture: Architecture.ARM_64,
        handler: 'log-group-retention-policy-updater.handler',
        code: Code.fromAsset(path.join(__dirname, '../lambda')),
        timeout: Duration.minutes(5),
        onFailure: new SnsDestination(
          logGroupRetentionPolicyUpdaterFailureTopic
        ),
      }
    );

    logGroupRetentionPolicyUpdater.role?.attachInlinePolicy(
      new Policy(this, 'UpdateRetentionPolicy', {
        statements: [
          new PolicyStatement({
            actions: ['logs:DescribeLogGroups', 'logs:PutRetentionPolicy'],
            resources: ['arn:aws:logs:*:*:log-group:*'],
          }),
        ],
      })
    );

    const rule = new Rule(this, 'LogGroupRetentionPolicyUpdaterRule', {
      schedule: Schedule.rate(Duration.days(7)),
    });

    rule.addTarget(
      new LambdaFunction(logGroupRetentionPolicyUpdater, {
        maxEventAge: Duration.minutes(2),
      })
    );
  }
}
