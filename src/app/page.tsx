import SearchResults from '../components/searchResults/searchResults';
import Playlist from '../components/playlist/playlist';
import SearchBar from '../components/searchBar/searchBar';
import NowPlayingBar from '../components/nowPlayingBar/nowPlayingBar'; // Adjusted path to match the correct file structure
import styles from './page.module.css';
import { useEffect, useState } from 'react';
import ACCESS from '../utils/apiUtils';
import { generateRandomString, makeApiRequest, createPlaylist, updatePlaylistItems, updatePlaylistName } from '../utils/apiUtils'; // Import utilities
import { createTimeStampSToLyricsTable, getCurrentLyrics } from '../utils/utils'; // Import the splitTimestampedLyric function
import packageJson from '../../package.json';
const { CLIENT_ID, CLIENT_SECRET, SCOPE } = ACCESS;

export default function App() {
  const port = packageJson.appConfig.port || 3000; 
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [username, setUserName] = useState<string>('User');
  const [userId, setUserId] = useState<string | null>(null);
  const [custom_playlist, setCustomPlaylist] = useState<any[]>([]);
  const [playlistId, setPlaylistId] = useState<string | null>(null);
  const [prevSaveReq, setPrevSaveReq] = useState<{ playlistName: string; trackUris: string[] }>({ playlistName: '', trackUris: [] }); // to store the previous request
  const [trackCickDisabled, setTrackClickDisabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [lastFetchedSongId, setLastFetchedSongId] = useState<string | null>(null);
  const [currentLyrics, setCurrentLyrics] = useState<(string | number)[][]>([]);
  const [timeStampedLyrics, setTimeStampedLyrics] = useState<[number, string][]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const handleLogin = () => {
    const redirect_uri = `${window.location.origin}:${port}/callback`; // Dynamically get the redirect URI
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
  };

  // Function to handle searching
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
      setError(error.message);
      console.log(error.message);
    }
  };

  const handleCallback = async () => {
    const redirect_uri = `${window.location.origin}:${port}/callback`; // Dynamically get the redirect URI
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code'); // Get the authorization code from the URL

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
        throw new Error(errorDetails.error_description || 'Failed to exchange authorization code for token');
      }
      const data = await response.json();
      setToken(data.access_token); // Save the access token in state
      console.log('Access Token:', data.access_token);
    } catch (error: any) {
      setError(error.message);
      console.error('Error exchanging authorization code for token:', error.message);
      console.error('error details:', error);
    }
  };

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
      console.log('User ID:', data.id);
    } catch (error: any) {
      setError(error.message);
      console.error('Error fetching Spotify username:', error.message);
    }
  };
  // function to save playlist to spotify
  const savePlaylist = async (playlistName:string) => { //we take these paraemeters to compare with previous state
    let headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
    try{
      const trackUris = custom_playlist.map((track) => track.uri);
      if(playlistName === prevSaveReq.playlistName && trackUris === prevSaveReq.trackUris) return;
      if (!token) return;
      if(!playlistName) {
        alert('Please enter a playlist name');
        return;
      }
      let tempPlaylistId=playlistId;
      //create a new playlist if playlistId doesn't exist, which means user is saving for the first time
      if(!playlistId){
        tempPlaylistId= await createPlaylist(headers, playlistName, userId);
        setPlaylistId(tempPlaylistId);
      }
      //if playlist has already been saved, update playlist name changes if any
      if(playlistId && prevSaveReq.playlistName !== playlistName){
        await updatePlaylistName(headers, playlistName, playlistId);
      }
      const message = await updatePlaylistItems(headers, playlistName, trackUris, tempPlaylistId, prevSaveReq);
      console.log(message);
      setPrevSaveReq({ playlistName: playlistName, trackUris });
      return message;
    } catch (error: any) {
      setError(error.message);
      console.error('Error saving playlist:', error.message);
      throw new Error(error.message);
    }
  };

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
        //console.log(currentPlayingTrack);
        return currentPlayingTrack;
      } else {
        return null;
      }
    } catch (error: any) {
      setError(error.message);
      console.error('Error fetching currently playing track:', error.message);
    }
  };

const getTimeStampedLyrics = async (songTitle: string, artistName: string, album: string) => {
  const endpoint = `https://lrclib.net/api/get?`+ new URLSearchParams({
    track_name: songTitle,
    artist_name: artistName,
    album_name: album,
  });
  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error('Failed to fetch lyrics');
    }
    const data = await response.json();
    return data.syncedLyrics;
  } catch (error) {
    console.error('Error fetching lyrics:', error);
    return null;
  }
}

const playTrack = async (track:any) => {
  const pos_ms = currentTrack?.progress_ms || 0; // Get the current position in milliseconds
  if (!token) return;
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
    setIsPlaying(true); // Set isPlaying to true when the track is played
  } catch (error: any) {
    setError(error.message);
    console.error('Error playing track:', error.message);
    alert('Your spotify player is not active. Please play a song on your spotify app before using this feature.');
  }
}

const pauseTrack = async () => {
  if (!token) return;
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    const playEndpoint = `https://api.spotify.com/v1/me/player/pause`;
    await makeApiRequest(playEndpoint, 'PUT', headers);
  } catch (error: any) {
    setError(error.message);
    console.error('Error playing track:', error.message);
    alert('something went wrong');
  }
}

  // const getGeniusLyricsForSong = async (songTitle: string, artistName: string) => {
  //   if (!geniusToken) return;
  //   try {
  //     const headers = {
  //       Authorization: `Bearer ${geniusToken}`,
  //       'Content-Type': 'application/json',
  //     };
  //     const searchEndpoint = `https://api.genius.com/search?q=${encodeURIComponent(songTitle + ' ' + artistName)}`;
  //     const data = await makeApiRequest(searchEndpoint, 'GET', headers);
  //     if (data && data.response && data.response.hits.length > 0) {
  //       const songData = data.response.hits[0].result;
  //       const lyricsPath = songData.path;
  //       const lyricsUrl = `https://genius.com${lyricsPath}`;
  //       console.log('Lyrics URL:', lyricsUrl);
  //       return lyricsUrl;
  //     } else {
  //       console.log('No lyrics found for the song');
  //       return null;
  //     }
  //   } catch (error: any) {
  //     setError(error.message);
  //     console.error('Error fetching lyrics from Genius:', error.message);
  //     return null;
  //   }
  // };


  useEffect(() => {
    if (token && !userId) {
      fetchSpotifyUser();
    }
  }, [token]);

  useEffect(() => {
    if (currentTrack && timeStampedLyrics.length > 0) {
      const { progress_ms } = currentTrack;
      const latestLyrics = getCurrentLyrics(timeStampedLyrics, progress_ms);
      if (latestLyrics[0][0]!=currentLyrics[currentLyrics.length-1][0]) {
        setInterval(() => {}, 150);
        setCurrentLyrics(latestLyrics);
      }
    }
  }, [currentTrack, timeStampedLyrics]);

  useEffect(() => {
    if (token) {
      const intervalId = setInterval(async () => {
        const currentPlaying = await getCurrentPlayingTrack();
        if (currentPlaying) {
          setIsPlaying(currentPlaying.is_playing);
          // Check if the song has changed
          if (currentPlaying.id !== lastFetchedSongId) {
            setCurrentLyrics([[0,'']]); // Reset current lyrics when the song changes
            setLastFetchedSongId(currentPlaying.id); // Update the last fetched song ID
            try{
            const timeStampedLyrics = await getTimeStampedLyrics(currentPlaying.name, currentPlaying.artists, currentPlaying.album);
            if (timeStampedLyrics) {
              console.log('Time-stamped lyrics:', timeStampedLyrics);
              const lyricsArray=timeStampedLyrics.split('\n');
              const lyricsTable = createTimeStampSToLyricsTable(lyricsArray);
              setTimeStampedLyrics(lyricsTable); // Split the lyrics into lines
            }else{
              //alert("no lyrics found for this song");
              setTimeStampedLyrics([]); // Reset time-stamped lyrics if none found
            }
            }catch (error: any) {
              setError(error.message);
              console.error('Error fetching time-stamped lyrics:', error.message);
            }
          }
          setCurrentTrack(currentPlaying); // Update the currently playing track
        }
      }, 500); // Run every 0.5 seconds
  
      return () => clearInterval(intervalId); // Cleanup interval on component unmount
    }
  }, [token, lastFetchedSongId]);

  useEffect(() => {
    if (window.location.pathname === '/callback') {
      handleCallback();
    }
  }, []);
  
    // Function to handle track click
    const onTrackClick = (track: any) => {
      if (!custom_playlist.some((t) => t.id === track.id)) {
        setCustomPlaylist((prevPlaylist) => [...prevPlaylist, track]);
      }
    };
  
    const onTrackRemove = (track: any) => {
      setCustomPlaylist((prevPlaylist) =>
        prevPlaylist.filter((t) => t.id !== track.id)
      );
    };

  return (
    <div className="app">
      <header className={styles.header}>
        {!token ? (
          <button onClick={handleLogin}>Login to Spotify</button>
        ) : (
          <p>hello {username.toLocaleLowerCase()}</p>
        )}
      </header>
      {!token ? (
        <p>welcome to spotify translate</p>
      ) : (
        <>
          <SearchBar onSearch={handleSearch} />
          <div className={styles.listContainer}>
            <SearchResults searchResults={searchResults} onTrackClick={onTrackClick} trackClickDisabled={trackCickDisabled} onTrackPlay={playTrack}/>
            <Playlist playlistId={playlistId} playlist={custom_playlist} onTrackAdd={onTrackRemove} onPlaylistSave={savePlaylist} trackClickDisabled={trackCickDisabled} setTrackClickDisabled={setTrackClickDisabled} onTrackPlay={playTrack}/>
          </div>
          <NowPlayingBar track={currentTrack} currentLyrics={currentLyrics} pauseFunc={pauseTrack} playFunc={playTrack} isPlaying={isPlaying} />
        </>
      )}
    </div>
  );
}
