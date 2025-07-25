import React, { useEffect } from "react";
import styles from "./nowPlayingBar.module.css";
import LyricsBar from "../lyricsBar/lyricsBar";

const NowPlayingBar = ({
  track,
  currentLyrics,
  plainLyrics,
  pauseFunc,
  playFunc,
  prevFunc,
  nextFunc,
  addToLiked,
  refreshCurrentLyrics,
}) => {
  const handlePause = () => {
    pauseFunc();
    // This is a placeholder for the actual play/pause logic
    // You can replace playFunc and pauseFunc with actual functions that control playback
    // You can add actual play/pause logic here if needed
  };

  const handlePlay = () => {
    playFunc(track);
  };

  const handleNext = () => {
    nextFunc();
  };
  const handlePrev = () => {
    prevFunc();
  };

  return (
    <div className={styles.nowPlayingBarContainer}>
      <LyricsBar
        refreshCurrentLyrics={refreshCurrentLyrics}
        currentLyrics={currentLyrics}
        plainLyrics={plainLyrics}
      ></LyricsBar>
      <div className={styles.nowPlayingBar}>
        {track ? (
          <>
            <p>
              <strong>{track.name}</strong> by{" "}
              {Array.isArray(track.artists)
                ? track.artists.map((artist) => artist.name).join(", ")
                : track.artists}{" "}
              -{" "}
              <em>
                {track.album && track.album.name
                  ? track.album.name
                  : track.album}
              </em>
              <span
                className={styles.likeButton}
                onClick={() => {
                  addToLiked(track);
                }}
                aria-label="Add to Liked Songs"
                title="Add to Liked Songs"
                style={{
                  cursor: "pointer",
                  fontSize: "1.5em",
                  background: "none",
                  border: "none",
                  padding: "5px 0 0 10px",
                }}
                role="button"
                tabIndex={0}
              >
                +
              </span>
              <span
                onClick={handlePrev}
                className={styles.next}
                aria-label="Previous"
                style={{ marginLeft: "10px", cursor: "pointer" }}
                role="button"
                tabIndex={0}
              >
                ⏮
              </span>
              <span
                onClick={handlePause}
                className={`${styles.playPauseButton} ${styles.desktopOnly}`}
                aria-label="Pause"
                role="button"
                tabIndex={0}
              >
                ⏸︎
              </span>
              <span
                onClick={handlePlay}
                className={`${styles.playPauseButton} ${styles.desktopOnly}`}
                aria-label="Play"
                role="button"
                tabIndex={0}
              >
                ⏵︎
              </span>
              <span
                onClick={handlePause}
                className={`${styles.playPauseButton} ${styles.mobileOnly}`}
                aria-label="Pause"
                role="button"
                tabIndex={0}
              >
                ⏸️
              </span>
              <span
                onClick={handlePlay}
                className={`${styles.playPauseButton} ${styles.mobileOnly}`}
                aria-label="Play"
                role="button"
                tabIndex={0}
              >
                ▶️
              </span>
              <span
                onClick={handleNext}
                className={styles.next}
                aria-label="Next"
                style={{ marginLeft: "10px", cursor: "pointer" }}
                role="button"
                tabIndex={0}
              >
                ⏭
              </span>
            </p>
          </>
        ) : (
          <p>No Track is Currently Playing</p>
        )}
      </div>
    </div>
  );
};

export default NowPlayingBar;
