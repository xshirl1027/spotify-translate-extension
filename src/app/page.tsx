import SearchResults from '../components/searchResults/searchResults';
// import Playlist from '../components/playlist/playlist';
import SearchBar from '../components/searchBar/searchBar';
import NowPlayingBar from '../components/nowPlayingBar/nowPlayingBar'; // Adjusted path to match the correct file structure
import styles from './page.module.css';
import { useEffect, useState } from 'react';
import ACCESS from '../utils/apiUtils';
import { generateRandomString, makeApiRequest, fetchLyricsFromGenius, getMusixmatchSubtitlesByTrack } from '../utils/apiUtils'; // Import utilities
import { getCurrentLyrics, createTimeStampSToLyricsTable2 } from '../utils/utils'; // Import the splitTimestampedLyric function
import packageJson from '../../package.json';
const { CLIENT_ID, CLIENT_SECRET, SCOPE } = ACCESS;

export default function App() {
  const port = packageJson.appConfig.port || 3000; 
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [username, setUserName] = useState<string>('User');
  const [userId, setUserId] = useState<string | null>(null);
  // const [custom_playlist, setCustomPlaylist] = useState<any[]>([]);
  // const [playlistId, setPlaylistId] = useState<string | null>(null);
  // const [prevSaveReq, setPrevSaveReq] = useState<{ playlistName: string; trackUris: string[] }>({ playlistName: '', trackUris: [] }); // to store the previous request
  const [trackCickDisabled, setTrackClickDisabled] = useState(false);
  // const [error, setError] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [lastFetchedSongId, setLastFetchedSongId] = useState<string | null>(null);
  const [currentLyrics, setCurrentLyrics] = useState< [number, string][]|null>(null);
  const [timeStampedLyrics, setTimeStampedLyrics] = useState<[number, string][]|null>([]);
  const [plainLyrics, setPlainLyrics] = useState<string[]|null>(null);
  // const [isPlaying, setIsPlaying] = useState(false);

  // Function to handle login and redirect to Spotify's authorization page
  const handleLogin = () => {
    var redirect_uri = `${window.location.origin}:${port}/callback`; // Dynamically get the redirect URI
    // Replace http with https if present in the redirect URI
    if (redirect_uri.startsWith('http://')) {
      redirect_uri = redirect_uri.replace('http://', 'https://');
    }
      const state = generateRandomString(16);
      const authUrl = `https://accounts.spotify.com/authorize?` +
        new URLSearchParams({
          response_type: 'code',
          client_id: CLIENT_ID,
          scope: SCOPE,
          redirect_uri: redirect_uri,
          state: state,
        }).toString();
      // Redirect the user to Spotify's authorization page
      window.location.href = authUrl;
  }
  
  // Function to handle searching and sets search results
  const handleSearch = async (searchTerm: string) => {
    if (!searchTerm || !token) return;
    try {
      const searchEndpoint = `https://api.spotify.com/v1/search?q=${encodeURIComponent(
        searchTerm
      )}&type=track,artist,album&limit=10`;
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      const data = await makeApiRequest(searchEndpoint, 'GET', headers);
      setSearchResults(data.tracks?.items || []); // Adjust based on the response structure
    } catch (error: any) {
      // setError(error.message);
      console.log(error.message);
    }
  };

  //gets authorization code from the URL and exchanges it for an access token
  const handleCallback = async () => {
    var redirect_uri = `${window.location.origin}:${port}/callback`; // Dynamically get the redirect URI
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code'); // Get the authorization code from the URL
    if (redirect_uri.startsWith('http://')) {
      redirect_uri = redirect_uri.replace('http://', 'https://');
    }
    if (!code) {
      console.error('Authorization code not found');
      return;
    }
    try {
      const reqObject = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`, // Base64 encode client_id:client_secret
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: redirect_uri, // Use the dynamically constructed redirect URI
        }).toString(),
      };
      const response = await fetch('https://accounts.spotify.com/api/token', reqObject);
      if (!response.ok) {
        const errorDetails = await response.json();
        console.error(errorDetails); // <-- This will show the real error from Spotify
        throw new Error(errorDetails.error_description || 'Failed to exchange authorization code for token');
      }
      const data = await response.json();
      setToken(data.access_token); // Save the access token in state
      //('Access Token:', data.access_token);
    } catch (error: any) {
      // setError(error.message);
      console.error('Error exchanging authorization code for token:', error.message);
      console.error('error details:', error);
      throw error;
    }
  };
// Function to fetch the Spotify user's profile
  const fetchSpotifyUser = async () => {
    if (!token) return;
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      // Make a request to the Spotify API to get the user's profile
      const data = await makeApiRequest('https://api.spotify.com/v1/me', 'GET', headers);
      setUserName(data.display_name); // Set the username or a default value
      setUserId(data.id); // Set the user ID or a default value
      //console.log('User ID:', data.id);
    } catch (error: any) {
      // setError(error.message);
      console.error('Error fetching Spotify username:', error.message);
    }
  };

  //sends api request to add track to users liked songs
  const addToLikedSongs = async (track: any) => {
    if (!token) return;
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      const body={
        "ids": [
            "string"
        ]
    }
      const endpoint = `https://api.spotify.com/v1/me/tracks?ids=${track.id}`;
      await makeApiRequest(endpoint, 'PUT', headers, body);
      alert(`${track.name} added to Liked Songs!`);
      console.log('added to liked songs:', track.name);
    } catch (error: any) {
      // setError(error.message);
      console.error('Error adding track to liked songs:', error.message);
    }
  }



  //sends api request to add track to users liked songs
  const checkifIsLikedSongs = async (track: any) => {
    if (!token) return;
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      const body={
        "ids": [
            "string"
        ]
      }
      const endpoint = `https://api.spotify.com/v1/me/tracks/contains?ids=${track.id}`;
      const result = await makeApiRequest(endpoint, 'GET', headers, body);
      return result[0]; // Returns true if the track is in the user's liked songs
    } catch (error: any) {
      // setError(error.message);
      console.error('Error adding track to liked songs:', error.message);
    }
  }

  // function to save playlist to spotify
  // const savePlaylist = async (playlistName:string) => { //we take these paraemeters to compare with previous state
  //   let headers = {
  //       'Authorization': `Bearer ${token}`,
  //       'Content-Type': 'application/json',
  //     };
  //   try{
  //     const trackUris: string[] = custom_playlist.map((track: any) => track.uri);
  //     if(playlistName === prevSaveReq.playlistName && trackUris === prevSaveReq.trackUris) return;
  //     if (!token) return;
  //     if(!playlistName) {
  //       alert('Please enter a playlist name');
  //       return;
  //     }
  //     let tempPlaylistId=playlistId;
  //     //create a new playlist if playlistId doesn't exist, which means user is saving for the first time
  //     if(!playlistId){
  //       tempPlaylistId= await createPlaylist(headers, playlistName, userId);
  //       setPlaylistId(tempPlaylistId);
  //     }
  //     //if playlist has already been saved, update playlist name changes if any
  //     if(playlistId && prevSaveReq.playlistName !== playlistName){
  //       await updatePlaylistName(headers, playlistName, playlistId);
  //     }
  //     const message = await updatePlaylistItems(headers, playlistName, trackUris, tempPlaylistId, prevSaveReq);
  //     //console.log(message);
  //     setPrevSaveReq({ playlistName: playlistName, trackUris });
  //     return message;
  //   } catch (error: any) {
  //     setError(error.message);
  //     console.error('Error saving playlist:', error.message);
  //     throw new Error(error.message);
  //   }
  // };
  // Function to fetch the currently playing track
  // Returns an object with track details or null if no track is playing
  // Also updates the isPlaying state
  const getCurrentPlayingTrack = async () => {
    if (!token) return;
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      const data = await makeApiRequest('https://api.spotify.com/v1/me/player/currently-playing', 'GET', headers);
      if (data && data.item) {
        const currentPlayingTrack = {
          id: data.item.id,
          name: data.item.name,
          artists: data.item.artists.map((artist: any) => artist.name).join(', '),
          album: data.item.album.name,
          uri: data.item.uri,
          progress_ms: data.progress_ms,
          timestamp: data.timestamp,
          is_playing: !data.actions.disallows?.pausing || true
        };
        // setIsPlaying(!data.actions.disallows?.pausing || true);
        //console.log(currentPlayingTrack);
        return currentPlayingTrack;
      } else {
        return null;
      }
    } catch (error: any) {
      // setError(error.message);
      console.error('Error fetching currently playing track:', error.message);
      if(error.message.includes('401')) window.location.reload();
    }
  };

  const getPlainLyrics = async (trackname: string, artistname: string) => {
    fetchLyricsFromGenius(trackname, artistname);
  }
  //fetches and returns time-stamped lyrics for the current track
  //will try again if the first fetch request fails
  const getTimeStampedLyrics = async (trackId: string) => {
    if(trackId === lastFetchedSongId && timeStampedLyrics && timeStampedLyrics.length > 0) {
      console.log('Using cached time-stamped lyrics for track:', trackId);
      return timeStampedLyrics; // Return cached lyrics if available
    }
    const endpoint = `https://spotify-lyrics-api-pi.vercel.app/?trackid=${trackId}`
    const headers = {
    };
    try {
      const response = await makeApiRequest(endpoint, 'GET', headers);
      if (response.error === false) {
          console.log('Fetched time-stamped lyrics:', response.lines);
          return response.lines; // Assuming the response data is in the expected format
        }
      return null;

    } catch (error: any) {
      try { //try again if first fetch request fails
        const response = await makeApiRequest(endpoint, 'GET', headers);
        if (response.error === false) {
          console.log('Fetched time-stamped lyrics:', response.lines);
          return response.lines; // Assuming the response data is in the expected format
        }
        return null;
      } catch (error: any) {
        if (error.message.includes('404') &&trackId !== lastFetchedSongId) {
          console.log('it looks like lyrics are either unavailable for this song, or the lyrics database is down--in which case please try again later');
        }        
        console.error('Error fetching time-stamped lyrics:', error.message);
      }
    }
  }

// Function to play the next track
const playNext = async (track:any) => {
  if (!token) return;
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    const playEndpoint = `https://api.spotify.com/v1/me/player/next`;
    await makeApiRequest(playEndpoint, 'POST', headers);
  } catch (error: any) {
    // setError(error.message);
    console.error('Error playing next track:', error.message);}
}
//function to play the previous track
const playPrev = async (track:any) => {
  if (!token) return;
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    const playEndpoint = `https://api.spotify.com/v1/me/player/previous`;
    await makeApiRequest(playEndpoint, 'POST', headers);
  } catch (error: any) {
    // setError(error.message);
    console.error('Error playing next track:', error.message);}
}
  
  //either play new track or resume current track
  const playTrack = async (track: any, newTrack = false) => {
    if (!token) return;
    var pos_ms = 0;
    if(track?.id !== currentTrack?.id) {
      setCurrentLyrics(null); // Reset current lyrics when a new track is played
      setPlainLyrics(null); 
      pos_ms = 0; //set position to 0 if a new track is played
      setLastFetchedSongId(currentTrack?.id); // Update the last fetched song ID
      // Reset current lyrics when a new track is played
      setTimeStampedLyrics([]);
      try{ //get and set the lyrics for the new song
          // const timeStampedLyrics = await getTimeStampedLyrics(track.id);
          // if (timeStampedLyrics) {
          // const lyricsTable = createTimeStampSToLyricsTable2(timeStampedLyrics);
          //   setTimeStampedLyrics(lyricsTable); // Split the lyrics into lines
            const musixmatchlyrics = await getMusixmatchSubtitlesByTrack(track.name, track.artists[0].name);
            console.log(musixmatchlyrics);
      // }else{
      //     setTimeStampedLyrics(null); // Reset time-stamped lyrics if none found
      // }
      }catch (error: any) {
          // setError(error.message);
          console.error('Error fetching time-stamped lyrics:', error.message);
      }
    } else {
      pos_ms = currentTrack?.progress_ms || 0; // not a new track, resume playing from current position
    }
    //fetch request to play the track
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      const playEndpoint = `https://api.spotify.com/v1/me/player/play`;
      const body = {
        "uris": [track.uri],
        "position_ms": pos_ms, // Set position to 0 if not provided
      };
      await makeApiRequest(playEndpoint, 'PUT', headers, body);
    } catch (error: any) {
      // setError(error.message);
      console.error('Error playing track:', error.message);
      if(error.message.includes('401')) window.location.reload();
      if(error.message.includes('404')) alert('Your spotify player is currently inactive. Please ensure you have played a song recently.');
    }
  }

// Function to pause the currently playing track
const pauseTrack = async () => {
  // setIsPlaying(false);
  if (!token) return;
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    const playEndpoint = `https://api.spotify.com/v1/me/player/pause`;
    await makeApiRequest(playEndpoint, 'PUT', headers);
  } catch (error: any) {
    // setError(error.message);
    console.error('Error playing track:', error.message);
  }
}

  useEffect(() => {
    if (token && !userId) { //if token is set and userId is not set, fetch user profile
      fetchSpotifyUser();
    }
  }, [token]);

  useEffect(() => {
    if (currentTrack && timeStampedLyrics && timeStampedLyrics.length > 0) {
      const { progress_ms } = currentTrack;
      const latestLyrics = getCurrentLyrics(timeStampedLyrics, progress_ms, currentLyrics);
      if (latestLyrics!=null && JSON.stringify(latestLyrics) != JSON.stringify(currentLyrics)) {
        setCurrentLyrics(latestLyrics);
      }
      if (latestLyrics == null || !timeStampedLyrics || timeStampedLyrics.length === 0) {
        setCurrentLyrics(null); // Show empty lyrics if no lyrics found
      }
    }
  }, [currentTrack, timeStampedLyrics]);

  useEffect(() => {
    if (token) {
      const intervalId = setInterval(async () => {
        const currentPlaying = await getCurrentPlayingTrack();
        if (currentPlaying) {
          // Check if the song has changed
          setCurrentTrack(currentPlaying); // Update the current track
          if (currentPlaying.id !== lastFetchedSongId) {
            setLastFetchedSongId(currentPlaying.id); // Update the last fetched song ID
            //setCurrentLyrics(null); // Reset current lyrics when a new track is played
            //setTimeStampedLyrics([]); // Reset time-stamped lyrics when a new track is played
            try{
            //const timeStampedLyrics = await getTimeStampedLyrics(currentPlaying.name, currentPlaying.artists, currentPlaying.album);
            const timeStampedLyrics = await getTimeStampedLyrics(currentPlaying.id);
              if (timeStampedLyrics) {
              //console.log('Time-stamped lyrics:', timeStampedLyrics);
              //const lyricsArray=timeStampedLyrics.split('\n');
              //const lyricsTable = createTimeStampSToLyricsTable(lyricsArray);
              const lyricsTable = createTimeStampSToLyricsTable2(timeStampedLyrics);
              setTimeStampedLyrics(lyricsTable); // Split the lyrics into lines
            }else{
                //alert("no lyrics found for this song");
              setCurrentLyrics(null); // Reset current lyrics if none found
              setTimeStampedLyrics([]); // Reset time-stamped lyrics if none found
            }
            }catch (error: any) {
              // setError(error.message);
              console.error('Error fetching time-stamped lyrics:', error.message);
            }
          }
          setCurrentTrack(currentPlaying); // Update the currently playing track
        }
      }, 400); // Run every 0.5 seconds
  
      return () => clearInterval(intervalId); // Cleanup interval on component unmount
    }
  }, [token, lastFetchedSongId]);

  useEffect(() => {
    // Check if the user is on the callback page with a code in the URL
    if (
      window.location.pathname === '/callback' &&
      new URLSearchParams(window.location.search).get('code')
    ) {
      handleCallback().catch(() => {
        // If login fails, redirect to main site
        window.location.href = 'https://spotify-translate.ca';
      });
    }
  }, []);
  
    // // Function to handle track click
    // const onTrackClick = (track: any) => {
    //   if (!custom_playlist.some((t) => t.id === track.id)) {
    //     setCustomPlaylist((prevPlaylist) => [...prevPlaylist, track]);
    //   }
    // };
  
    // const onTrackRemove = (track: any) => {
    //   setCustomPlaylist((prevPlaylist) =>
    //     prevPlaylist.filter((t) => t.id !== track.id)
    //   );
    // };

  return (
    <div className="app">
      <header className={styles.header}>
        {!token ? (
          <button className={styles.loginButton} onClick={handleLogin}>Login to Spotify</button>
        ) : (
          <p className={styles.helloUser}>hello {username.toLocaleLowerCase()}</p>
        )}
      </header>
      {!token ? (
        <p className={styles.welcomeText}>Welcome to Spotify Translate</p>
      ) : (
        <>
          <SearchBar onSearch={handleSearch} />
          <div className={styles.listContainer}>
              <SearchResults searchResults={searchResults} onTrackAdd={addToLikedSongs} trackClickDisabled={trackCickDisabled} onTrackPlay={playTrack}/>
            </div>
            <NowPlayingBar addToLikedSongs={addToLikedSongs} track={currentTrack} currentLyrics={currentLyrics} plainLyrics={plainLyrics} pauseFunc={pauseTrack} playFunc={playTrack} prevFunc={playPrev} nextFunc={playNext} getCurrentPlayingTrack={getCurrentPlayingTrack}/>
        </>
      )}
    </div>
  );
}
