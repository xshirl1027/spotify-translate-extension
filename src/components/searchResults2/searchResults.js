import React from "react";
import { useState, useEffect } from "react";

export default function searchResults({ results, onTrackClick }) {
  return (
    <div>
      {results.map((track) => (
        <div key={track.id} onClick={() => onTrackClick(track)}>
          <h3>{track.name}</h3>
          <p>{track.artist}</p>
        </div>
      ))}
    </div>
  );
}
