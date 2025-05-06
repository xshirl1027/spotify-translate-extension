import React from "react";
import { useState, useEffect } from "react";
import Track from "../track/track";
import styles from "./playlist.module.css";

export default function Playlist({
  playlistId,
  playlist,
  onTrackClick,
  onPlaylistSave,
}) {
  const [playlistTracks, setPlaylistTracks] = useState(playlist);
  const [playlistName, setPlaylistName] = useState("");
  const [buttonText, setButtonText] = useState("Save Playlist");

  useEffect(() => {
    setPlaylistTracks(playlist);
  }, [playlist]);

  useEffect(() => {
    if (playlistId) {
      setButtonText("Save Changes");
      prevPlaylistName = playlistName;
    }
  }, [playlistId]);

  const updatePlaylistName = (e) => {
    setPlaylistName(e.target.value);
    if (playlistId) {
      setButtonText("Save Changes");
    }
  };

  if (playlist.length === 0) {
    return <div class={styles.emptyPlaceholder}>Playlist Empty</div>;
  }

  const savePlaylist = () => {
    if (playlistName.length > 0) {
      setButtonText("Saving Playlist...");
      onPlaylistSave(playlistName)
        .then((result) => {
          if (result) {
            const originalText = buttonText;
            setButtonText("Playlist Saved!");
            setTimeout(() => {
              setButtonText(originalText);
            }, 1500);
          }
        })
        .catch((err) => {
          alert("something went wrong");
        });
    }
  };

  const handleTrackClick = (track) => {
    if (playlistId) {
      //if changes are made to existing playlist
      setButtonText("Save Changes");
    }
    onTrackClick(track);
  };

  return (
    <div className={styles.playlistContainer}>
      <input
        type="text"
        className={styles.playlistNameInput}
        placeholder="Enter playlist name"
        value={playlistName}
        onChange={updatePlaylistName}
      />

      <div className={styles.playlist}>
        {playlistTracks.map((track) => (
          <Track
            track={track}
            key={track.id}
            onTrackClick={handleTrackClick}
            listType={"playlist"}
          />
        ))}
      </div>
      <button className={styles.savetracks} onClick={savePlaylist}>
        {buttonText}
      </button>
    </div>
  );
}
