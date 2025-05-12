import React from "react";
import styles from "./lyricsBar.module.css";

const LyricsBar = ({ currentLyrics }) => {
  if (!currentlyrics) {
    return;
  }
  return (
    <div className={styles.lyricsBar}>
      currentLyrics.map((line) => (
      <div key={line.id} className={styles.lyricsLine}>
        <p>{line != "" ? line : "♪  ... ♪"}</p>
      </div>
      ))
    </div>
  );
};

export default LyricsBar;
