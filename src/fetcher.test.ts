import { join } from 'path';
import { readFile as origReadFile } from 'fs';
import { promisify } from 'util';
import { parseSchedules } from './fetcher';

const readFile = promisify(origReadFile);

const schedulesFixturesDir = join(__dirname, 'fixtures', 'schedules');

describe('#parseSchedules', () => {
  it('returns scheudles', async () => {
    const html = (
      await readFile(join(schedulesFixturesDir, 'schedules.html'))
    ).toString();

    expect(parseSchedules(html)).toMatchSnapshot();
  });
});
