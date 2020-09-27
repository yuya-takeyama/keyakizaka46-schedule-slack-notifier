import { WebClient } from '@slack/client';
import { Schedule } from './fetcher';

export const notifySchedules = async (
  slack: WebClient,
  channel: string,
  schedules: Schedule[],
): Promise<void> => {
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
};
