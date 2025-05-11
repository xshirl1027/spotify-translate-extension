import React from "react";
import styles from "./nowPlayingBar.module.css";
import { lyricsBar } from "../lyricsBar/lyricsBar";

const NowPlayingBar = ({ track, currentLyrics }) => {
  if (!track) {
    return <></>;
  }
  return (
    <div className={styles.nowPlayingBarContainer}>
      <lyricsBar currentLyrics={currentLyrics}></lyricsBar>
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
