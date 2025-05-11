import React from "react";
import styles from "./lyricsgBar.module.css";

const lyricsBar = ({ currentLyrics }) => {
  return (
    <div className={styles.lyricsBar}>
      {currentLyrics &&
        currentLyrics.map((line) => (
          <div key={line.id} className={styles.lyricsLine}>
            <p>{line != "" ? line : "♪  ... ♪"}</p>
          </div>
        ))}
    </div>
  );
};

export default NowPlayingBar;
