import React from "react";
import styles from "./nowPlayingBar.module.css";

const NowPlayingBar = ({ track, lyric }) => {
  if (!track) {
    return (
      <div className={styles.nowPlayingBar}>
        <p className={styles.lyrics}>No track is currently playing</p>
      </div>
    );
  }
  return (
    <div>
      <div className={styles.lyricsBar}>
        <p>{lyric}</p>
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
