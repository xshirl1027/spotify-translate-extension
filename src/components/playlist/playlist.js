import React from "react";
import { useState, useEffect } from "react";
import Track from "../track/track";
import styles from "./playlist.module.css";

export default function Playlist({ playlist, onTrackClick }) {
  const [playlistTracks, setPlaylistTracks] = useState(playlist);

  useEffect(() => {
    setPlaylistTracks(playlist);
  }, [playlist]);

  if (playlist.length === 0) {
    return <div class={styles.emptyPlaceholder}>Playlist Empty</div>;
  }

  return (
    <div className={styles.playlistContainer}>
      <div className={styles.playlist}>
        {playlistTracks.map((track) => (
          <Track
            track={track}
            key={track.id}
            onTrackClick={onTrackClick}
            listType={"playlist"}
          />
        ))}
      </div>
      <button className={styles.savetracks} onClick={() => {}}>
        Save To Spotify
      </button>
    </div>
  );
}
