import * as cdk from 'aws-cdk-lib';
import {
  Architecture,
  Code,
  CodeSigningConfig,
  Function,
  Runtime,
} from 'aws-cdk-lib/aws-lambda';
import {Platform, SigningProfile} from 'aws-cdk-lib/aws-signer';
import {Construct} from 'constructs';
import path = require('path');

export class AwsResourcesDefaultRetentionPolicyStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const signingProfile = new SigningProfile(this, 'SigningProfile', {
      platform: Platform.AWS_LAMBDA_SHA384_ECDSA,
    });

    const codeSigningConfig = new CodeSigningConfig(this, 'CodeSigningConfig', {
      signingProfiles: [signingProfile],
    });

    new Function(this, 'LogGroupRetentionPolicyUpdater', {
      codeSigningConfig,
      runtime: Runtime.NODEJS_18_X,
      architecture: Architecture.ARM_64,
      handler: 'log-group-retention-policy-updater.handler',
      code: Code.fromAsset(path.join(__dirname, '../lambda')),
    });
  }
}
