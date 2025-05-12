import React from "react";
import styles from "./lyricsBar.module.css";

const LyricsBar = ({ currentLyrics }) => {
  if (currentLyrics === undefined || currentLyrics.length === 0) {
    return <></>;
  }
  return (
    <div className={styles.lyricsBar}>
      {currentLyrics.map((line) => (
        <div key={line.id} className={styles.lyricsLine}>
          <p>{line !== "" ? line : "♪  ... ♪"}</p>
        </div>
      ))}
    </div>
  );
};

export default LyricsBar;
