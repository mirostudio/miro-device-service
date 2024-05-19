/**
 * A media schedule is a list of media ids with start and end
 * instants (in seonds since epoch) specifying the duration when
 * that media file will be played.
 * 
 * A media schedule is like:
 * { id: "video004.mp4", start: 1716003000, end: 1716003010 },
 * { id: "video049.mp4", start: 1716003010, end: 1716003030 },
 * . . .
 * 
 * The durations should be non overlapping, and the entries sorted
 * in increasing order of time instants.
 * In the above examples the 2 consecutive durations are 10 sec
 * and 20 sec. Ideally those should match the durations of the
 * corresponding video files, i.e. the two videos should be 10 sec
 * and 20 sec long.
 * There could be gap in the schedule, in which case the media player
 * will show some default static image (with logo and contact).
 */

interface ScheduleEntry {
  start: number,  // Second since epoch
  end: number,    // Second since epoch
  id: string,     // media id
}

class Schedule {
  private readonly entries: Array<ScheduleEntry> = [];

  public currentEntries() : Array<ScheduleEntry> {
    return this.entries;
  }

  public mergeEntries(newEntries: Array<ScheduleEntry>) : void {
    const merged = _mergeEntries(this.entries, newEntries);
    this.entries.length = 0;
    this.entries.push(...merged);
  }

  /**
   * Get the entries which has non empty overlap with the given duration.
   * @param start The start of the interval
   * @param end The end of the interval
   * @returns List of entries.
   */
  public getMatchingEntries(start: number, end: number) : Array<ScheduleEntry> {
    const range = {start, end};
    return this.entries.filter((entry) => _overlapEntries(entry, range));
  }
}

function _mergeEntries(listA: Array<ScheduleEntry>, listB: Array<ScheduleEntry>) : Array<ScheduleEntry> {
  const merged : Array<ScheduleEntry> = [];
  if (listA.length === 0 || listB.length === 0) {
    if (listA.length > 0) { merged.push(...listA); }
    if (listB.length > 0) { merged.push(...listB); }
    return merged;
  }

  let i = 0, j = 0;
  while (i < listA.length && j < listB.length) {
    const entryA = listA[i], entryB = listB[j];
    if (_overlapEntries(entryA, entryB)) {
      // Entry of listB gets priority.
      // TODO: Explain why.
      merged.push(entryB);
      ++j;
    } else if (entryA.start >= entryB.end) {
      merged.push(entryB);
      ++j;
    } else if (entryB.start >= entryA.end) {
      merged.push(entryA);
      ++i;
    }
  }
  return merged;
}

function _overlapEntries(
  entryA: {start: number, end: number},
  entryB: {start: number, end: number}) : boolean {
  return (entryB.start < entryA.end && entryA.start < entryB.end)
}

export { type ScheduleEntry, Schedule }