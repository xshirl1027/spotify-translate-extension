import React from "react";
import styles from "./nowPlayingBar.module.css";

const NowPlayingBar = ({ track, currentLyrics }) => {
  if (!track) {
    return <></>;
  }
  return (
    <div className={styles.nowPlayingBarContainer}>
      <div className={styles.lyricsBar}>
        {currentLyrics &&
          currentLyrics.map((line) => (
            <div key={line.id} className={styles.lyricsLine}>
              <p>{line != "" ? line : "♪  ... ♪"}</p>
            </div>
          ))}
      </div>
      <div className={styles.nowPlayingBar}>
        <p>
          <strong>{track.name}</strong> by {track.artists} -{" "}
          <em>{track.album}</em>
        </p>
      </div>
    </div>
  );
};

export default NowPlayingBar;
