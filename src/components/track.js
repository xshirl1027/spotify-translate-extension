import React from "react";
import { useState, useEffect } from "react";

export default track ({ track, onTrackClick }) {   

    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isStopped, setIsStopped] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
}
