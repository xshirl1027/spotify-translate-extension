import React from "react";
import styles from "./nowPlayingBar.module.css";
import LyricsBar from "../lyricsBar/lyricsBar";

const NowPlayingBar = ({ track, currentLyrics }) => {
  return (
    <div className={styles.nowPlayingBarContainer}>
          <LyricsBar currentLyrics={currentLyrics}></LyricsBar>
          <div className={styles.nowPlayingBar}>
          {track ? (
            <>
            <p>
              <strong>{track.name}</strong> by {track.artists} -{" "}
              <em>{track.album}</em>
            </p>
            </>
          ) : (
        <p>No Track is Currently Playing</p>
          </div>
    </div>
  );
};

export default NowPlayingBar;
