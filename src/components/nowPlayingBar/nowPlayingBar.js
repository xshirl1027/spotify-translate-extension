import React, { useEffect } from "react";
import styles from "./nowPlayingBar.module.css";
import LyricsBar from "../lyricsBar/lyricsBar";

const NowPlayingBar = ({
  track,
  currentLyrics,
  playFunc,
  pauseFunc,
  getCurrentPlayingTrack,
}) => {
  useEffect(() => {
    const interval = setInterval(async () => {
      const currentTrack = await getCurrentPlayingTrack();
      window.isPlaying = currentTrack?.is_playing;
      console.log("windows isplaying:" + window.isPlaying);
    }, 500);
    return () => clearInterval(interval);
  }, []);
  const handlePlayPause = () => {
    if (isPlaying) {
      pauseFunc();
    } else {
      playFunc(track);
    }
    // This is a placeholder for the actual play/pause logic
    // You can replace playFunc and pauseFunc with actual functions that control playback
    console.log(isPlaying ? "playing" : "paused");
    // You can add actual play/pause logic here if needed
  };

  const toggle = () => {
    if (!window.__togglePlayPause) {
      window.__togglePlayPause = true;
    } else {
      window.__togglePlayPause = !window.__togglePlayPause;
    }
  };

  return (
    <div className={styles.nowPlayingBarContainer}>
      <LyricsBar currentLyrics={currentLyrics}></LyricsBar>
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
              {/* <span
                onClick={handlePlayPause}
                className={styles.playPauseButton}
                aria-label={isPlaying ? "Pause" : "Play"}
                style={{ marginLeft: "10px", cursor: "pointer" }}
                role="button"
                tabIndex={0}
              >
                {isPlaying ? "⏸︎" : "⏵︎"}
              </span> */}
              <span
                onClick={toggle}
                className={styles.playPauseButton}
                aria-label="Play/Pause"
                style={{ marginLeft: "10px", cursor: "pointer" }}
                role="button"
                tabIndex={0}
              >
                {/* Simple toggle using a ref, not connected to any state */}
                {window.isPlaying ? "⏵︎" : "⏸︎"}
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
