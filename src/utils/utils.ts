export function getTimestampAndLyric(line:string) {
    const timestampRegex = /^\[\d{2}:\d{2}\.\d{2}\]/; // Regex to match timestamp
    const match = line.match(timestampRegex);
  
    if (match) {
        const timestampstr = match[0].slice(1,match[0].length-2); // Extract timestamp
        const lyric = line.substring(timestampstr.length).trim(); // Remove timestamp and leading/trailing spaces
        const [minutes, seconds, hundrethsecond] = timestampstr.split(':').map(Number);
        const timestamp_ms = minutes * 60 * 1000 + seconds * 1000 + hundrethsecond * 10; // Convert to milliseconds
      return { timestamp_ms, lyric };
    } else {
      return { timeStamp_ms: null, lyric: line }; // Return original line if no timestamp
    }
  }
  