import {
  CloudWatchLogsClient,
  DescribeLogGroupsCommand,
  PutRetentionPolicyCommand,
} from '@aws-sdk/client-cloudwatch-logs';
import {Handler} from 'aws-lambda';

export const handler: Handler = async (event, context) => {
  const client = new CloudWatchLogsClient({region: 'us-east-1'});

  const describeLogGroupsResponse = await client.send(
    new DescribeLogGroupsCommand({})
  );
  describeLogGroupsResponse.logGroups?.forEach(logGroup => {
    const putRetentionPolicyCommand = new PutRetentionPolicyCommand({
      logGroupName: logGroup.logGroupName,
      retentionInDays: 7,
    });

    client.send(putRetentionPolicyCommand);
  });
};
