import { APIGatewayProxyHandler, Handler } from 'aws-lambda';
import { fetchSchedules } from './fetcher';
import moment from 'moment';
import { WebClient } from '@slack/web-api';
import { notifySchedules } from './notifier';

export const notify: Handler = async () => {
  try {
    if (typeof process.env.SLACK_TOKEN === 'undefined') {
      throw new Error('SLACK_TOKEN is not set');
    }

    const slackToken = process.env.SLACK_TOKEN;

    if (typeof process.env.SLACK_CHANNEL === 'undefined') {
      throw new Error('SLACK_CHANNEL is not set');
    }

    const channel = process.env.SLACK_CHANNEL;
    const slack = new WebClient(slackToken);
    const schedules = await fetchSchedules(moment());
    console.log('%j', schedules);
    if (process.env.SERVERLESS_STAGE === 'production') {
      await notifySchedules(slack, channel, schedules);
    } else {
      console.log('Skip notifying to Slack');
    }
    console.log('Finished');
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const healthz: APIGatewayProxyHandler = async () => {
  try {
    const schedules = await fetchSchedules(moment());

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: true,
        schedules,
      }),
    };
  } catch (err) {
    console.error(err);
    throw err;
  }
};
