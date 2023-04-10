import {Stack, StackProps} from 'aws-cdk-lib';
import {
  DetailType,
  NotificationRule,
} from 'aws-cdk-lib/aws-codestarnotifications';
import {Topic} from 'aws-cdk-lib/aws-sns';
import {EmailSubscription} from 'aws-cdk-lib/aws-sns-subscriptions';
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
} from 'aws-cdk-lib/pipelines';
import {Construct} from 'constructs';
import {PipelineStage} from './pipeline-stage';

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const codePipeline = new CodePipeline(
      this,
      'AwsResourcesDefaultRetentionPolicyStackPipeline',
      {
        pipelineName: 'AwsResourcesDefaultRetentionPolicyStackPipeline',
        synth: new ShellStep('synth', {
          input: CodePipelineSource.gitHub(
            'sourabh-pisal/aws-resources-default-retention-policy',
            'main'
          ),
          commands: ['npm ci', 'npm run build'],
        }),
      }
    );

    codePipeline.addStage(
      new PipelineStage(this, 'prod', {env: {region: 'us-east-1'}})
    );

    codePipeline.buildPipeline();

    const pipelineTopic = new Topic(
      this,
      'AwsResourcesDefaultRetentionPolicyStackPipelineTopic'
    );
    pipelineTopic.addSubscription(
      new EmailSubscription('{{resolve:ssm:email}}')
    );

    const notificationRule = new NotificationRule(
      this,
      'AwsResourcesDefaultRetentionPolicyStackPipelineNotification',
      {
        detailType: DetailType.BASIC,
        notificationRuleName:
          'AwsResourcesDefaultRetentionPolicyStackPipelineNotification',
        events: [
          'codepipeline-pipeline-pipeline-execution-failed',
          'codepipeline-pipeline-pipeline-execution-canceled',
          'codepipeline-pipeline-pipeline-execution-succeeded',
          'codepipeline-pipeline-pipeline-execution-superseded',
        ],
        source: codePipeline.pipeline,
        targets: [pipelineTopic],
      }
    );

    notificationRule.node.addDependency(pipelineTopic);
  }
}
