import React from "react";
import { useState, useEffect } from "react";
import Track from "../track/track";
import styles from "./playlist.module.css";

export default function Playlist({
  playlistId,
  playlist,
  onTrackAdd,
  onPlaylistSave,
  trackClickDisabled,
  setTrackClickDisabled,
  onTrackPlay,
}) {
  const [playlistTracks, setPlaylistTracks] = useState(playlist);
  const [playlistName, setPlaylistName] = useState("");
  const [buttonText, setButtonText] = useState("save playlist to spotify");
  const buttonTexts = {
    savePlaylist: "save playlist",
    savingPlaylist: "saving playlist...", //needed becasue save takes a long time
    playlistSaved: "playlist saved!",
    saveChanges: "save changes",
    changesSaved: "changes saved!",
  };
  let prevPlaylistName = "";
  let changesMade = false;

  useEffect(() => {
    setPlaylistTracks(playlist);
  }, [playlist]);

  useEffect(() => {
    if (playlistId) {
      prevPlaylistName = playlistName;
    }
  }, [playlistId]);

  const updatePlaylistName = (e) => {
    setPlaylistName(e.target.value);
    if (playlistId) {
      //if changes are made to existing playlist
      //change button text to save changes
      setButtonText(buttonTexts.saveChanges);
      changesMade = true;
    }
  };

  const savePlaylist = () => {
    if (playlistName.length > 0) {
      setTrackClickDisabled(true); //disable removing items when saving
      if (!playlistId) {
        setButtonText(buttonTexts.savingPlaylist);
      }
      onPlaylistSave(playlistName, playlistTracks)
        .then((result) => {
          if (result) {
            changesMade = false;
            const originalText = buttonText;
            if (result === "playlist updated") {
              setButtonText(buttonTexts.changesSaved);
            }
            if (result === "playlist saved") {
              setButtonText(buttonTexts.playlistSaved);
            }
            setTimeout(() => {
              setButtonText(originalText);
              setTrackClickDisabled(false);
            }, 1500);
          }
        })
        .catch((err) => {
          alert("something went wrong: " + JSON.stringify(err));
          console.log("error:", err);
        });
    }
    setTrackClickDisabled(false);
  };

  const handleTrackClick = (track) => {
    if (playlistId) {
      //if changes are made to existing playlist
      setButtonText(buttonTexts.saveChanges);
      changesMade = true;
    }
    onTrackAdd(track);
  };

  if (playlistTracks.length === 0 && playlistId === null)
    return (
      <div className={styles.playlistContainer}>
        Play a track on spotify or search for tracks to play.
      </div>
    );

  return (
    (playlist.length > 0 || playlistId || playlistName) && (
      <div className={styles.playlistContainer}>
        <input
          type="text"
          className={styles.playlistNameInput}
          placeholder="enter playlist name"
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
              disabled={trackClickDisabled}
              onTrackPlay={onTrackPlay}
            />
          ))}
        </div>
        <button className={styles.savetracks} onClick={savePlaylist}>
          {buttonText}
        </button>
      </div>
    )
  );
}
