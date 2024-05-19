import { TaskRunner } from "../threads/taskrunner"
import { ScheduleEntry } from "./schedule";

interface InitArgs {
  path: string
}

interface ScheduleMakerPayload {
  msg: string
}

class ScheduleMaker extends TaskRunner<ScheduleMakerPayload> {
  private generator: Function;

  constructor({ path } : InitArgs) {
    super("ScheduleMaker")
    console.log("@Init path = " + path);
    this.generator = nextEntriesGen();
  }

  public async runAsync(args: ScheduleMakerPayload) {
    const entries = this.generator();
    console.log('ScheduleMaker run $$$$$ ... ' + args.msg);
    console.log(entries);
  }
}

function nextEntriesGen() {
  type MediaEntry = {
    id: string;
    dur: number;
  };

  const mediaList: Array<MediaEntry> = [
    { id: "video01.mp4", dur: 10},
    { id: "video02.mp4", dur: 20},
    { id: "video03.mp4", dur: 30},
    { id: "video04.mp4", dur: 10},
    { id: "videoA4.mp4", dur: 20},
    { id: "videoB3.mp4", dur: 20},
    { id: "video0C.mp4", dur: 10},
  ];

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
    const secNow = (new Date()).getTime() / 1000;
    const bucketNow = ((secNow + bucketSizeSec + bufferSecs) / bucketSizeSec)|0;
    const startBucket = Math.max(lastBucket, bucketNow * bucketSizeSec);
    const endBucket = (bucketNow + 2) * bucketSizeSec;
    const allEntries: ScheduleEntry[] = [];
    if (startBucket >= endBucket) {
      return allEntries;
    }
    for (let bucket = startBucket; bucket < endBucket; ++bucket) {
      const bucketEntries = entriesInBucketFn(bucket);
      allEntries.push(...bucketEntries);
    }
    lastBucket = endBucket;
    return allEntries;
  };
}

function _shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
}

export default ScheduleMaker