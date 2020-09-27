import { Handler } from 'aws-lambda';
import { fetchSchedules } from './fetcher';
import moment from 'moment';
import { WebClient } from '@slack/client';
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
    notifySchedules(slack, channel, schedules);
    console.log('Finished');
  } catch (err) {
    console.error(err);
    throw err;
  }
};
