import {
  CloudWatchLogsClient,
  DescribeLogGroupsCommand,
  PutRetentionPolicyCommand,
} from '@aws-sdk/client-cloudwatch-logs';
import {Handler} from 'aws-lambda';

export const handler: Handler = async () => {
  const client = new CloudWatchLogsClient({region: 'us-east-1'});

  const describeLogGroupsResponse = await client.send(
    new DescribeLogGroupsCommand({})
  );
  describeLogGroupsResponse.logGroups?.forEach(async logGroup => {
    const putRetentionPolicyCommand = new PutRetentionPolicyCommand({
      logGroupName: logGroup.logGroupName,
      retentionInDays: 7,
    });

    console.log(
      `Updating retention policy for log group ${logGroup.logGroupName} to 7 days.`
    );
    await client.send(putRetentionPolicyCommand);
  });
};
