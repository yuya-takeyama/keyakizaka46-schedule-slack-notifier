import axios from 'axios';
import { JSDOM } from 'jsdom';
import { first, map, tail, trim } from 'lodash';
import moment from 'moment';
import striptags from 'striptags';

const BASE_URL = 'http://www.keyakizaka46.com';

const toURL = (path: string): string => {
  return `${BASE_URL}${path}`;
};

export interface Schedule {
  title?: string;
  time: ScheduleTime;
  genre?: string;
  description?: string;
}

export interface ScheduleTime {
  from?: string;
  to?: string;
}

const normalize = (str: string | undefined | null): string | undefined => {
  return str ? trim(striptags(str)) || undefined : undefined;
};

export const parseTime = (time?: string): ScheduleTime => {
  if (time) {
    const [from, to] = time.split('～');
    return { from: normalize(from), to: normalize(to) };
  } else {
    return { from: undefined, to: undefined };
  }
};

const parseScheduleElement = (element: any): Schedule | undefined => {
  const titleDescriptionElement = element.querySelector(
    '.box-detail_txt :last-child',
  );
  const genreElement = element.querySelector('.box-detail_genre');
  const timeElement = element.querySelector('.box-detail_txt .time');

  if (titleDescriptionElement) {
    const titleDescriptions = trim(
      striptags(titleDescriptionElement.innerHTML),
    ).split(/\n/);
    const title = first(titleDescriptions);
    const description = normalize(tail(titleDescriptions).join('\n'));
    const time = parseTime(
      timeElement ? normalize(timeElement.innerHTML) : undefined,
    );

    return {
      title,
      genre: genreElement ? normalize(genreElement.innerHTML) : undefined,
      time,
      description,
    };
  } else {
    return undefined;
  }
};

export const fetchSchedules = async (
  date: moment.Moment,
): Promise<Schedule[]> => {
  return new Promise<Schedule[]>(async (resolve, reject) => {
    try {
      const res = await axios.get(
        toURL(`/s/k46o/media/list?dy=${date.format('YYYYMMDD')}`),
      );
      const schedules = parseSchedules(res.data);

      resolve(schedules);
    } catch (err) {
      reject(err);
    }
  });
};

export const parseSchedules = (data: string): Schedule[] => {
  const scheduleElements = new JSDOM(data).window.document.querySelectorAll(
    '#schedule .box-schedule_inner .box-detail',
  );
  return map(scheduleElements, element => parseScheduleElement(element)).filter(
    schedule => schedule,
  ) as Schedule[];
};

export const toValidJSON = (js: string): string => {
  return js
    .replace(/([a-zA-Z]+):/g, '"$1":')
    .replace(/'(.*)'(,?)/g, (_, p1, p2) => `${JSON.stringify(p1)}${p2}`);
};
