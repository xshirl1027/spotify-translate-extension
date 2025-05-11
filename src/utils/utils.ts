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

  export const getCurrentLyrics = (lyricsArray: [number, string][], progress_ms: number) => {
    let start = 0;
    let end = lyricsArray.length - 1;
    if(progress_ms < lyricsArray[0][0]) {
        return ''; //show empty if the singing hasn't started
    }
    if(progress_ms > lyricsArray[lyricsArray.length - 1][0]) {
        return lyricsArray[lyricsArray.length - 1][1]; //show the last lyric if the song is over
    }
    while (start <= end) {
        let mid = Math.floor((start + end) / 2);
        const [timestamp, lyric] = lyricsArray[mid];
        const [prevTimestamp, prev_lyric] = mid - 1 >= 0 ? lyricsArray[mid - 1] : [-Infinity, ''];
        const [nextTimestamp, next_lyric] = mid + 1 < lyricsArray.length ? lyricsArray[mid + 1] : [Infinity, ''];
        if(timestampIsBetween(progress_ms, prevTimestamp, timestamp)) {
            return lyricsArray[prevTimestamp][1];
        }
        if(timestampIsBetween(progress_ms, timestamp, nextTimestamp)) {
            return lyricsArray[timestamp][1];
        }
        if(progress_ms < timestamp) {
            end = mid - 1;
        }
        if(progress_ms > timestamp) {
            start = mid + 1;
        }
    }
    return ''; 
}

  
function parseLyricLine(line: string) {
    const timestampRegex = /^\[\d{2}:\d{2}\.\d{2}\]/; // Regex to match timestamp
    const match = line.match(timestampRegex);
    if(match === null) {
        return { timestamp_ms: null, lyric: line }; // Return null if no timestamp
    }
    const timestampstr = match[0].slice(1,match[0].length-2); // Extract timestamp
    const lyric = line.substring(timestampstr.length).trim(); // Remove timestamp and leading/trailing spaces
    const [minutes, seconds, hundrethsecond] = timestampstr.split(':').map(Number);
    const timestamp_ms = minutes * 60 * 1000 + seconds*1000 + hundrethsecond*10; // Convert to seconds
    return { timestamp_ms, lyric };
}