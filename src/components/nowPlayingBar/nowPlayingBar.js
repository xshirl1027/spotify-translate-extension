import React from "react";
import styles from "./nowPlayingBar.module.css";

const NowPlayingBar = ({ track }) => {
  if (!track) {
    return (
      <div className={styles.nowPlayingBar}>
        <p>No track is currently playing</p>
      </div>
    );
  }
  return (
    <div className={styles.nowPlayingBar}>
      <p>
        <strong>{track.name}</strong> by {track.artists} -{" "}
        <em>{track.album}</em>
      </p>
    </div>
  );
};

export default NowPlayingBar;
