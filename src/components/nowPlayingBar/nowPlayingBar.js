import React, { useEffect } from "react";
import styles from "./nowPlayingBar.module.css";
import LyricsBar from "../lyricsBar/lyricsBar";

// Add this function or import it if you have an API utility
const addToLikedSongs = async (trackId) => {
  // Replace this with your actual API call to add to liked songs
  // Example: await fetch(`/api/like/${trackId}`, { method: "POST" });
  alert("Added to Liked Songs!"); // Placeholder
};

const NowPlayingBar = ({
  track,
  currentLyrics,
  plainLyrics,
  pauseFunc,
  playFunc,
  prevFunc,
  nextFunc,
  getCurrentPlayingTrack,
  addToLikedSongs,
}) => {
  useEffect(() => {
    const interval = setInterval(async () => {
      const currentTrack = await getCurrentPlayingTrack();
      window.isPlaying = currentTrack?.is_playing;
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handlePause = () => {
    pauseFunc();
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

  const handleAddToLiked = () => {
    if (track && track.id) {
      addToLikedSongs(track.id);
      alert("Track added to Liked Songs!");
    }
  };

  return (
    <div
      className={styles.nowPlayingBarContainer}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <LyricsBar currentLyrics={currentLyrics} plainLyrics={plainLyrics} />
      <div
        className={styles.nowPlayingBar}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        {track ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <span>
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
            </span>
            <span
              className={styles.likeButton}
              onClick={handleAddToLiked}
              aria-label="Add to Liked Songs"
              title="Add to Liked Songs"
              style={{
                marginLeft: "10px",
                cursor: "pointer",
                fontSize: "1.5em",
                background: "none",
                border: "none",
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
          </div>
        ) : (
          <p>No Track is Currently Playing</p>
        )}
      </div>
    </div>
  );
};

export default NowPlayingBar;
