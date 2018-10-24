import { Callback, Context, Handler, ScheduledEvent } from 'aws-lambda';
import { fetchSchedules } from './fetcher';
import * as moment from 'moment';
import { WebClient } from '@slack/client';

export const notify: Handler = async (
  event: ScheduledEvent,
  context: Context,
  cb: Callback,
) => {
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
    console.log(schedules);
    const promises = schedules.map(schedule => {
      const fields: { title: string; value: string; short?: boolean }[] = [];
      if (schedule.genre) {
        fields.push({
          title: 'Genre',
          value: schedule.genre,
          short: true,
        });
      }
      if (schedule.time.from || schedule.time.to) {
        fields.push({
          title: 'Time',
          value: `${schedule.time.from || ''}~${schedule.time.to || ''}`,
          short: true,
        });
      }

      return slack.chat.postMessage({
        channel: channel,
        text: schedule.title || '',
        attachments: [
          {
            fields,
          },
        ],
        username: '今日のスケジュール',
        icon_url: 'http://www.keyakizaka46.com/files/14/images/top/logo_l.jpg',
        mrkdwn: false,
      });
    });
    await Promise.all(promises);
    console.log('Finished');
  } catch (err) {
    console.error(err);
    throw err;
  }
};
