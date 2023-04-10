import {Stack, StackProps} from 'aws-cdk-lib';
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
} from 'aws-cdk-lib/pipelines';
import {Construct} from 'constructs';

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new CodePipeline(this, 'AwsResourcesDefaultRetentionPolicyStackPipeline', {
      pipelineName: 'AwsResourcesDefaultRetentionPolicyStackPipeline',
      synth: new ShellStep('synth', {
        input: CodePipelineSource.gitHub(
          'sourabh-pisal/aws-resources-default-retention-policy',
          'main'
        ),
        commands: ['npm ci', 'npm run build'],
      }),
    });
  }
}
