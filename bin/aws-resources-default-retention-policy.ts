#!/usr/bin/env node
import 'source-map-support/register';
import {PipelineStack} from '../lib/pipeline-stack';
import {App, Tags} from 'aws-cdk-lib';

const app = new App();
const pipeline = new PipelineStack(
  app,
  'AwsResourcesDefaultRetentionPolicyStackPipeline',
  {
    env: {
      region: 'us-east-1',
    },
  }
);

Tags.of(pipeline).add('project', 'AwsResourcesDefaultRetentionPolicy');

app.synth();
