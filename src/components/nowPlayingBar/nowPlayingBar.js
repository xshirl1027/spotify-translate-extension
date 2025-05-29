import React from "react";
import styles from "./nowPlayingBar.module.css";
import LyricsBar from "../lyricsBar/lyricsBar";

const NowPlayingBar = ({ track, currentLyrics, playFunc, pauseFunc }) => {
  const [isPlaying, setIsPlaying] = React.useState(false);

  const handlePlayPause = () => {
    setIsPlaying((prev) => !prev);
    isPlaying ? pauseFunc() : playFunc(track);
    // This is a placeholder for the actual play/pause logic
    // You can replace playFunc and pauseFunc with actual functions that control playback
    console.log(isPlaying ? "Paused" : "Playing");
    // You can add actual play/pause logic here if needed
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
              <button
                onClick={handlePlayPause}
                className={styles.playPauseButton}
                aria-label={isPlaying ? "Pause" : "Play"}
                style={{ marginLeft: "10px" }}
              >
                {isPlaying ? "⏸︎" : "⏵︎"}
              </button>
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
