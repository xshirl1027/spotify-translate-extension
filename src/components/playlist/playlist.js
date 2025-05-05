import React from "react";
import { useState, useEffect } from "react";
import Track from "../track/track";
import styles from "./playlist.module.css";

export default function Playlist({ playlist, onTrackClick, onPlaylistSave }) {
  const [playlistTracks, setPlaylistTracks] = useState(playlist);

  useEffect(() => {
    setPlaylistTracks(playlist);
  }, [playlist]);

  if (playlist.length === 0) {
    return <div class={styles.emptyPlaceholder}>Playlist Empty</div>;
  }

  const savePlaylist = () => {
    onPlaylistSave(tracks);
  };

  return (
    <div className={styles.playlistContainer}>
      <input
        type="text"
        className={styles.playlistNameInput}
        placeholder="Enter playlist name"
      />

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
      <button className={styles.savetracks} onClick={onPlaylistSave}>
        Save To Spotify
      </button>
    </div>
  );
}
