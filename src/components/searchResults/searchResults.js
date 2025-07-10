import React from "react";
import Track from "../track/track";
import styles from "./searchResults.module.css";

export default function SearchResults({
  searchResults,
  onTrackClick,
  trackClickDisabled,
  onTrackPlay,
  addToLiked,
}) {
  if (searchResults.length === 0)
    return <div className={styles.searchResultsContainer}></div>;
  return (
    <div className={styles.searchResultsContainer}>
      <div className={styles.searchResults}>
        {searchResults.map((track) => (
          <Track
            track={track}
            key={track.id}
            onTrackClick={(track) => addToLiked(track)}
            listType={"searchResults"}
            clickDisabled={trackClickDisabled}
            onTrackPlay={() => onTrackPlay(track, true)}
          />
        ))}
      </div>
      {/* Add the invisible button */}
      <button className={styles.invisibleButton}>Save To Spotify</button>
    </div>
  );
}
