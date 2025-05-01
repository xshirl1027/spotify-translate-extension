import React from "react";
import { useState, useEffect } from "react";

export default tracklist ({ tracklist, onTrackClick }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isStopped, setIsStopped] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);

    return (
        <div>
            {tracklist.map((track) => (
                <div key={track.id} onClick={() => onTrackClick(track)}>
                    <h3>{track.name}</h3>
                    <p>{track.artist}</p>
                </div>
            ))}
        </div>
    );
}
