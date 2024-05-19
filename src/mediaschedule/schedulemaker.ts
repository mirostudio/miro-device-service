import fs from "node:fs";
import path from "node:path";
import { TaskRunner } from "../threads/taskrunner"
import { ScheduleEntry } from "./schedule";

interface InitArgs {
  path: string
}

interface ScheduleMakerPayload {
  msg: string
}

type MediaEntry = {
  id: string;
  dur: number;
};

const kMediaList: Array<MediaEntry> = [
  { id: "video01.mp4", dur: 10},
  { id: "video02.mp4", dur: 20},
  { id: "video03.mp4", dur: 30},
  { id: "video04.mp4", dur: 10},
  { id: "videoA4.mp4", dur: 20},
  { id: "videoB3.mp4", dur: 20},
  { id: "video0C.mp4", dur: 10},
];


class ScheduleMaker extends TaskRunner<ScheduleMakerPayload> {
  private generator: Function;

  constructor({ path } : InitArgs) {
    super("ScheduleMaker")
    console.log("@Init path = " + path);
    this.generator = nextEntriesGen(kMediaList);
  }

  public async runAsync(args: ScheduleMakerPayload) {
    console.log('ScheduleMaker run $$$$$ ... ' + args.msg);
    const entries = this.generator();
    global.aaaa = "prop-aaaa";
    global.bbbb = this;
    if (entries.length === 0) {
      return;
    }
    console.log(entries);
  }
}

function nextEntriesGen(fixedMediaList: Array<MediaEntry>) {
  const mediaList: Array<MediaEntry> = [...fixedMediaList];
  const nextMediaToPlay = () => {
    const media = mediaList.shift() as MediaEntry;
    if (!media) {
      throw new Error();
    }
    _shuffleArray(mediaList);  // Shuffle the remaining elements.
    mediaList.push(media);
    return media as MediaEntry;
  };

  const bucketSizeSec = 30;
  const entriesInBucketFn = (bucket: number) => {
    const bucketStartSec = bucket * bucketSizeSec;
    const bucketEndSec = bucketStartSec + bucketSizeSec;
    let nextStartSec = bucketStartSec;
    const entries: ScheduleEntry[] = [];
    while (nextStartSec < bucketEndSec) {
      const media = nextMediaToPlay();
      const mediaEndSec = nextStartSec + media.dur;
      if (mediaEndSec > bucketEndSec) {
        break;
      }
      entries.push({
        id: media.id,
        start: nextStartSec,
        end: mediaEndSec,
      } as ScheduleEntry);
      nextStartSec = mediaEndSec;
    }
    return entries;
  };

  const bufferSecs = 10;
  let lastBucket = 0;

  return () => {
    const secNow = ((new Date()).getTime() / 1000 + bufferSecs)|0;
    const bucketNow = ((secNow + bucketSizeSec) / bucketSizeSec)|0;
    const allEntries: ScheduleEntry[] = [];
    console.log({secNow, bucketNow, lastBucket});
    if (bucketNow < lastBucket) {
      return allEntries;
    }
    const startBucket = Math.max(lastBucket, bucketNow);
    const endBucket = startBucket + 2;
    console.log({startBucket, endBucket});
    for (let bucket = startBucket; bucket < endBucket; ++bucket) {
      const bucketEntries = entriesInBucketFn(bucket);
      allEntries.push(...bucketEntries);
    }
    lastBucket = endBucket;
    const entriesByBuckets = SplitScheduleByBucket(60, allEntries);
    console.log(entriesByBuckets);
    for (const key in entriesByBuckets) {
      console.log("Key = " + key);
      MergeBucketScheduleInFile(Number.parseInt(key), entriesByBuckets[key]);
    }
    if (false) {
      SaveScheduleToDisk(allEntries);
    }
    return allEntries;
  };
}

function SplitScheduleByBucket(bucketSizeSec: number, schedule: Array<ScheduleEntry>) {
  const result = {};
  schedule.forEach((entry: ScheduleEntry) => {
    const startBucket = (entry.start / bucketSizeSec)|0;
    const endBucket = ((entry.end - 0.1) / bucketSizeSec)|0;
    if (startBucket !== endBucket) {
      console.error("Schedule entry crosses bucket border: " + JSON.stringify(entry));
      return;
    }
    if (!result[startBucket]) {
      result[startBucket] = [];
    }
    result[startBucket].push(entry);
  });
  return result;
}

function MergeBucketScheduleInFile(bucket: number, schedule: Array<ScheduleEntry>) {
  const filePath = path.join("./data", `bucket-${bucket}.json`);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath).toString();
    const entries = JSON.parse(content) as Array<ScheduleEntry>;
    entries.push(...schedule);
    content = JSON.stringify(schedule);
    fs.writeFileSync(filePath, content, { flag: 'w' });
  } else {
    const content = JSON.stringify(schedule);
    fs.writeFileSync(filePath, content);
  }
}

function SaveScheduleToDisk(schedule: Array<ScheduleEntry>) {
  const content = JSON.stringify(schedule);
  const filePath = path.join("./data", "schedule.json");
  fs.writeFileSync(filePath, content);
}

function _shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
}

export default ScheduleMaker