import React from "react";
import styles from "./nowPlayingBar.module.css";
import LyricsBar from "../lyricsBar/lyricsBar";

const NowPlayingBar = ({ track, currentLyrics }) => {
  if (!track) {
    return <></>;
  }
  return (
    <div className={styles.nowPlayingBarContainer}>
      {track ? (
        <>
          <LyricsBar currentLyrics={currentLyrics}></LyricsBar>
          <div className={styles.nowPlayingBar}>
            <p>
              <strong>{track.name}</strong> by {track.artists} -{" "}
              <em>{track.album}</em>
            </p>
          </div>
        </>
      ) : (
        <p>No Track is Currently Playing</p>
      )}
    </div>
  );
};

export default NowPlayingBar;
