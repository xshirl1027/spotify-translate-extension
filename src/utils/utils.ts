export function createTimeStampSToLyricsTable(lyrics: string[]) {
    const timeStampLyricsTable: [number, string][] = [];
    for(const i in lyrics){
        console.log(lyrics[i]);
        const { timestamp_ms, lyric } = parseLyricLine(lyrics[i]);
            if (timestamp_ms !== null && timestamp_ms !== undefined) {
                timeStampLyricsTable.push([timestamp_ms, lyric]);
            }
         }
    return timeStampLyricsTable;
  }


  function timestampIsBetween(progress_ms: number, prev_ms: number, next_ms: number){
        // Check if progress_ms is between prev_ms and next_ms
        if(progress_ms >= prev_ms && progress_ms <= next_ms) {
            return true;
        }else{
            return false;
        }
    }

  export const getCurrentLyrics = (lyricsArray: [number, string][], progress_ms: number, prevLyrics:[number, string][]) => {
    let start = 0;
    let end = lyricsArray.length - 1;
    if(progress_ms < lyricsArray[0][0]) {
        return [[0,''],[]]; //show empty if the singing hasn't started
    }
    //   console.log("prevLyrics"+prevLyrics);
      if (prevLyrics && prevLyrics.length>0 && progress_ms>=prevLyrics[0][0]&&progress_ms<prevLyrics[prevLyrics.length - 1][0]) {
          return prevLyrics; // Return previous lyrics if progress_ms is still within the previous lyrics window
      }
    while (start <= end) {
        let mid = Math.floor((start + end) / 2);
        const [timestamp, lyric] = lyricsArray[mid];
        const [nextTimestamp, next_lyric] = mid + 1 < lyricsArray.length ? lyricsArray[mid + 1] : [Infinity, ''];
        const [nextTimestamp2, next_lyric2] = mid + 2 < lyricsArray.length ? lyricsArray[mid + 2] : [Infinity, ''];
        const nextTimestamp3 = mid + 3 < lyricsArray.length ? lyricsArray[mid + 3][0] : Infinity;
        //if progress_ms is between the current selected timestamp and the previous timestamp 
        // or if progress_ms is between the current selected timestamp and the next timestamp
        if(timestampIsBetween(progress_ms, timestamp, nextTimestamp)) {
            return [[timestamp,lyric], [nextTimestamp, next_lyric], [nextTimestamp2, next_lyric2], [nextTimestamp3,'']]; // Return the previous lyric if progress_ms is between prevTimestamp and timestamp
        }
        // if(timestampIsBetween(progress_ms, timestamp, nextTimestamp)) {
        //     return [[timestamp,lyric], [nextTimestamp, next_lyric]];
        // }
        if(progress_ms < timestamp) {
            end = mid - 1;
        }
        if(progress_ms > timestamp) {
            start = mid + 1;
        }
    }
    return [[0,''],[]]; // Return empty string if no match found
}

  
function parseLyricLine(line: string) {
    const timestampRegex = /^\[\d{2}:\d{2}\.\d{2}\]/; // Regex to match timestamp
    const match = line.match(timestampRegex);
    if(match === null) {
        return { timestamp_ms: null, lyric: line }; // Return null if no timestamp
    }
    const timestampstr = match[0].substring(1,match[0].length-1).replace(".",":"); // Extract and process timestamp string for conversion
    const lyric = line.substring(match[0].length, line.length).trim(); // Remove timestamp and leading/trailing spaces
    const [minutes, seconds, hundrethsecond] = timestampstr.split(':').map(Number);
    const timestamp_ms = minutes * 60 * 1000 + seconds*1000 + hundrethsecond*10; // Convert to seconds
    return { timestamp_ms, lyric };
}

export function decodeHtmlEntities(text:string) {
  const txt = document.createElement("textarea");
  txt.innerHTML = text;
  return txt.value;
}