import {StackProps, Stage} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {AwsResourcesDefaultRetentionPolicyStack} from './aws-resources-default-retention-policy-stack';

export class PipelineStage extends Stage {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new AwsResourcesDefaultRetentionPolicyStack(
      this,
      'AwsResourcesDefaultRetentionPolicyStack'
    );
  }
}
