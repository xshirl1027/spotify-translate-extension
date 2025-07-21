import React, { useEffect, useState } from 'react';
import SearchResults from '../components/searchResults/searchResults';
import Playlist from '../components/playlist/playlist';
import SearchBar from '../components/searchBar/searchBar';
import NowPlayingBar from '../components/nowPlayingBar/nowPlayingBar'; // Adjusted path to match the correct file structure
import styles from './page.module.css';
import ACCESS from '../utils/apiUtils';
import { generateRandomString, makeApiRequest, createPlaylist, updatePlaylistItems, updatePlaylistName } from '../utils/apiUtils'; // Import utilities
import { createTimeStampSToLyricsTable, getCurrentLyrics } from '../utils/utils'; // Import the splitTimestampedLyric function
import packageJson from '../../package.json';
import Image from 'next/image';

const {SCOPE } = ACCESS;

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
  const [timeStampedLyrics, setTimeStampedLyrics] = useState<[number, string][]|null>([]);
  const [plainLyrics, setPlainLyrics] = useState<string|null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [inputClientId, setInputClientId] = useState<string>('');
  const [inputClientSecret, setInputClientSecret] = useState<string>('');
  const [showImageModal, setShowImageModal] = useState(false);
  const handleLogin = () => {
    if(inputClientId && inputClientSecret){
       // Set cookies for client ID and secret
    document.cookie = `spotify_client_id=${encodeURIComponent(inputClientId)}; path=/`;
    document.cookie = `spotify_client_secret=${encodeURIComponent(inputClientSecret)}; path=/`;

    var redirect_uri = `${window.location.origin}:${port}/callback`;
    if (redirect_uri.startsWith('http://')) {
      redirect_uri = redirect_uri.replace('http://', 'https://');
    }
    const state = generateRandomString(16);
    const authUrl = `https://accounts.spotify.com/authorize?` +
      new URLSearchParams({
        response_type: 'code',
        client_id: inputClientId,
        scope: SCOPE,
        redirect_uri: redirect_uri,
        state: state,
      } as Record<string, string>).toString();
    window.location.href = authUrl;
    }
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
    console.log(inputClientId);
    console.log(inputClientSecret);
    var redirect_uri = `${window.location.origin}:${port}/callback`;
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (redirect_uri.startsWith('http://')) {
      redirect_uri = redirect_uri.replace('http://', 'https://');
    }
    if (!code) {
      console.error('Authorization code not found');
      return;
    }
    // Read from localStorage
    try {
      const clientId = getCookie('spotify_client_id');
      const clientSecret = getCookie('spotify_client_secret');
      const reqObject = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: redirect_uri,
        }).toString(),
      };
      const response = await fetch('https://accounts.spotify.com/api/token', reqObject);
      // Ignore the response here and check the browser URL for the token only
      // No need to parse response or set token here
      if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(errorDetails.error_description || 'Failed to exchange authorization code for token');
      }
      const data = await response.json();
      setToken(data.access_token); // Save the access token in state
      console.log('Access Token:', data.access_token);
      // Check the browser URL for the token (access_token in query or hash)
      // const urlParams = new URLSearchParams(window.location.search);
      // const accessToken = urlParams.get('code');
      // if (accessToken) {
      //   setToken(accessToken);
      // }
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
      const trackUris: string[] = custom_playlist.map((track: any) => track.uri);
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
        setIsPlaying(!data.actions.disallows?.pausing || true);

        //console.log(currentPlayingTrack);
        return currentPlayingTrack;
      } else {
        return null;
      }
    } catch (error: any) {
      setError(error.message);
      console.error('Error fetching currently playing track:', error.message);
      if(error.message.includes('401')) window.location.reload();
    }
  };

  //makes api call to the lrclib.net lyrics db to fetch time-stamped lyrics
const getTimeStampedLyrics = async (
  songTitle: string,
  artistName: string,
  album: string
) => {
  // If artistName is an array, join to string
  const artistStr = Array.isArray(artistName) ? artistName.join(', ') : artistName;
  const endpoint = `https://lrclib.net/api/get?` + new URLSearchParams({
    track_name: songTitle,
    artist_name: artistStr,
    album_name: album,
  });
  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error('Failed to fetch lyrics');
    }
    var data = await response.json();
    // console.log('Fetched lyrics:', data.syncedLyrics);
    if (data.syncedLyrics && data.syncedLyrics.length > 0) {
      return data.syncedLyrics;
    }
    if (!data.syncedLyrics || data.syncedLyrics.length === 0) {
      
      if (data.plainLyrics || data.plainLyrics.length >= 0) {
        console.log('Fetched plain lyrics: ', data.plainLyrics);
        setPlainLyrics(data.plainLyrics); //keep plain lyrics just in case synced lyrics aren't found available later
      }
              // If there are multiple artists and we haven't tried with just the first artist, try again
      if (artistStr.includes(',')) {
                const firstArtist = artistStr.split(',')[0].trim();
                return getTimeStampedLyrics(songTitle, firstArtist, album);
      }
      const res = await fetch( //synced lyrics isn't available call musixmatch
        `https://proxy.cors.sh/https://api.musixmatch.com/ws/1.1/matcher.subtitle.get?` +
          new URLSearchParams({
            apikey: 'b04f6e8f37cca67c1054c0ec6d4232df',
            q_track: songTitle,
            q_artist: artistStr,
          }),
        {
          headers: {
            'x-cors-api-key': process.env.REACT_APP_CORS_API_KEY || '',
          },
        }
      );
      data = await res.json();
      if (data?.message?.body?.subtitle?.subtitle_body) {
        return data?.message?.body?.subtitle?.subtitle_body;
      }
    }
  } catch (error: any) {
    try { //there's an error with lcrlib, call musix match
      const res = await fetch(
        `https://proxy.cors.sh/https://api.musixmatch.com/ws/1.1/matcher.subtitle.get?` +
          new URLSearchParams({
            apikey: 'b04f6e8f37cca67c1054c0ec6d4232df',
            q_track: songTitle,
            q_artist: artistStr,
          }),
        {
          headers: {
            'x-cors-api-key': 'live_285dcea35de0512813821dab5d30988a0fe9a0c52a8ae0ddd0dd5ee9ceec8bad',
          },
        }
      );
      data = await res.json();
      if (data?.message?.body?.subtitle?.subtitle_body) {
        return data?.message?.body?.subtitle?.subtitle_body;
      } else {
        //console.log("musixmatch failed after lrclib.net, check for plain lyrics from lrclib.net");
        // If there are multiple artists and we haven't tried with just the first artist, try again
        if (artistStr.includes(',')) {
          const firstArtist = artistStr.split(',')[0].trim();
          return getTimeStampedLyrics(songTitle, firstArtist, album);
        } else {
          console.error('Error fetching lyrics:', error.message);
          setCurrentLyrics([[0,"you'll have to guess the lyrics for this one."],[]]);     
        }
      }
      } catch (error) {
        setCurrentLyrics([[0,"you'll have to guess the lyrics for this one."],[]]); 
        console.error('Error fetching lyrics:', error);
        return null;
      }
    }
  }


const playNext = async () => {
  if (!token) return;
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    const playEndpoint = `https://api.spotify.com/v1/me/player/next`;
    await makeApiRequest(playEndpoint, 'POST', headers);
  } catch (error: any) {
    setError(error.message);
    console.error('Error playing next track:', error.message);}
}
  
const playPrev = async () => {
  if (!token) return;
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    const playEndpoint = `https://api.spotify.com/v1/me/player/previous`;
    await makeApiRequest(playEndpoint, 'POST', headers);
  } catch (error: any) {
    setError(error.message);
    console.error('Error playing next track:', error.message);}
}
  
const playTrack = async (track:any, newTrack=false) => {
  setIsPlaying(true);
  const pos_ms = newTrack?0:currentTrack?.progress_ms || 0; // Get the current position in milliseconds
  if (pos_ms == 0) {
    setCurrentLyrics([[0, '']]); // Reset current lyrics if starting a new track
    setTimeStampedLyrics([]); // Reset time-stamped lyrics if starting a new track
  }
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
    if(error.message.includes('401')) window.location.reload();
    if(error.message.includes('404')) alert('Your spotify player is currently inactive. Please ensure you have played a song recently.');
  }
}

const pauseTrack = async () => {
  setIsPlaying(false);
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
  }
}

  useEffect(() => {
    if (token && !userId) {
      fetchSpotifyUser();
    }
  }, [token]);

  useEffect(() => {
    if (currentTrack && timeStampedLyrics && timeStampedLyrics.length > 0) {
      const { progress_ms } = currentTrack;
      const latestLyrics = getCurrentLyrics(timeStampedLyrics, progress_ms, currentLyrics);
      if (JSON.stringify(latestLyrics)!=JSON.stringify(currentLyrics)) {
        if(latestLyrics&& latestLyrics.length > 1) setCurrentLyrics(latestLyrics);
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
              setTimeStampedLyrics(null); // Reset time-stamped lyrics if none found
            }
            } catch (error: any) {
                // Send a fetch request to Musixmatch API and log the results
                fetch('https://api.musixmatch.com/ws/1.1/matcher.subtitle.get?apikey=b04f6e8f37cca67c1054c0ec6d4232df&q_track=baby&q_artist=justin%20bieber')
                  .then(res => res.json())
                  .then(data => console.log('Musixmatch result:', data))
                  .catch(err => console.error('Musixmatch fetch error:', err));
              setError(error.message);
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

  const refreshCurrentLyrics = async () => {
    if (!currentTrack) return;
    setCurrentLyrics([[0, '']]); // Clear current lyrics
    setTimeStampedLyrics([]);    // Clear timestamped lyrics

    try {
      // Fetch new timestamped lyrics for the current track
      const timeStampedLyricsRaw = await getTimeStampedLyrics(
        currentTrack.name,
        currentTrack.artists,
        currentTrack.album
      );
      if (timeStampedLyricsRaw) {
        const lyricsArray = timeStampedLyricsRaw.split('\n');
        const lyricsTable = createTimeStampSToLyricsTable(lyricsArray);
        setTimeStampedLyrics(lyricsTable);

        // Get and set the current lyrics based on the current progress
        const latestLyrics = getCurrentLyrics(
          lyricsTable,
          currentTrack.progress_ms,
          currentLyrics
        );
        setCurrentLyrics(latestLyrics);
      } else {
        setTimeStampedLyrics([]); // No lyrics found
        setCurrentLyrics([[0, '']]);
      }
    } catch (error: any) {
      setError(error.message);
      setTimeStampedLyrics([]);
      setCurrentLyrics([[0, '']]);
      console.error('Error refreshing lyrics:', error.message);
    }
  };

  return (
    <div className="app">
      <header className={styles.header}>
        {!token ? (
        <>
            <div style={{ width: "60%", margin: "0 auto" }}>
              <h3>Hello, we are the lyrics translation app for spotify, providing real-time lyrics and translation into 11 languages including English, French and Spaish, all for free and adless for now. Mobile compatible.</h3>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                <img
                  src="https://github.com/xshirl1027/spotify-translate-extension/blob/main/public/images/screenshot_app.png?raw=true"
                  alt="Spotify Translate Logo"
                  style={{ width: "55%", borderRadius: 16, cursor: "pointer" }}
                  onClick={() => setShowImageModal(true)}
                />
              </div>
              {showImageModal && (
                <div
                  style={{
                    position: "fixed",
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(0,0,0,0.8)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 9999
                  }}
                  onClick={() => setShowImageModal(false)}
                >
                  <img
                    src="/images/screenshot_app.png"
                    alt="Spotify Translate Logo"
                    style={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: 16, boxShadow: "0 0 20px #000" }}
                    onClick={e => e.stopPropagation()}
                  />
                </div>
              )}
          {/* <h3>Welcome to spotify-translate--an app-extension that provides real-time lyrics and the ability to translate them to any language, for any spotify song that can be played on their platform, for your foreign language lyrics translation needs.</h3> */}
              <h3>Login Instructions: </h3>
              Spotify, being a massive platform, has strict rules for how applications like ours can connect to their service--one of which is that they require
              250k monthly users before allowing new apps to use their login services (which doesn't make a lot sense if you think about it. it's difficult to gain new users without a proper login) you can read their requirements <a href="https://docs.google.com/forms/d/1O87xdPP1zWUDyHnduwbEFpcjA57JOaefCgBShKjAqlo/viewform?edit_requested=true" target="_blank" rel="noopener noreferrer">here</a>. Anyways so, as a new app, we have to temporarily ask you to take a some extra steps to log in:
              <ol>
            <li>
              go to spotify's developers dashboard here:{" "}
              <a href="https://developer.spotify.com/" target="_blank" rel="noopener noreferrer">
          https://developer.spotify.com/
              </a>{" "}
              and log in
            </li>
            <li>Click on your username on the right and click on dashboard</li>
            <li>Click Create App</li>
            <li>Enter any app name or description</li>
            <li>Add <code>https://spotify-translate.ca:443/callback</code> to the redirect URIs</li>
                <li>Check all the check boxes under "Which API/SDKs are you planning to use?" and check "I understand and agree ..."</li>
                <li>Click save</li>
          </ol>
              Then copy and paste the client ID and Secret here:
          <br /><br />
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <label style={{ width: "100%", maxWidth: 300, color: "#fff" }}>
            Client ID:
            <input
              type="text"
              value={inputClientId}
              onChange={e => setInputClientId(e.target.value)}
              onKeyDown={e => {
              if (e.key === 'Enter') handleLogin();
              }}
              style={{ width: "100%", marginTop: 2, marginBottom: 8 }}
              placeholder="Spotify Client ID"
            />
            </label>
            <label style={{ width: "100%", maxWidth: 300, color: "#fff" }}>
            Client Secret:
            <input
              type="password"
              value={inputClientSecret}
              onChange={e => setInputClientSecret(e.target.value)}
              onKeyDown={e => {
              if (e.key === 'Enter') handleLogin();
              }}
              style={{ width: "100%", marginTop: 2, marginBottom: 8 }}
              placeholder="Spotify Client Secret"
            />
            </label>
            <button style={{width:"123px"}}
              onClick={handleLogin}
            >
              Login to Spotify
                </button>
                <br></br>
                *the client id and secret will not be stored by our website but will be retained by your browser so you don't need to copy and paste them everytime</div>
        </div>
            </>
        ) : (
          <p style={{textAlign:"center"}}>hello {username.toLocaleLowerCase()}</p>
        )}
      </header>
      {!token ? (
        <>
          <div
            className={styles.introText}
            style={{
              maxWidth: 600,
              margin: "0 auto",
              fontSize: "1.1em",
              color: "#ddd",
              padding: "1em 0",
              borderRadius: "10px"
            }}
          >
            {/* <h2>Unlock the World of Foreign Music with Spotify-Translate!</h2> */}
            {/* Have you ever vibed to a K-Pop or Spanish song on Spotify and wish you understood the lyrics, only to find that there is no translation function? Fret not! Spotify-Translate is an simple easy-to-use app extension that displays real-time lyrics that can be viewed and translated into almost any language, including English, French, Russian, and Chinese, all while your song is playing. */}
            {/* Our website is completely secure, backed by GoDaddy's best security package, and mobile-compatible (android only for now) so you can log in with confidence. Simply connect your Spotify account and unlock your favorite foreign language songs in totally new ways. */}
          </div>
        </>
      ) : (
        <>
          <SearchBar onSearch={handleSearch} />
          <div className={styles.listContainer}>
            <SearchResults addToLiked={addToLikedSongs} searchResults={searchResults} onTrackClick={onTrackClick} trackClickDisabled={trackCickDisabled} onTrackPlay={playTrack}/>
            {/* <Playlist playlistId={playlistId} playlist={custom_playlist} onTrackAdd={onTrackRemove} onPlaylistSave={savePlaylist} trackClickDisabled={trackCickDisabled} setTrackClickDisabled={setTrackClickDisabled} onTrackPlay={playTrack}/> */}
          </div>
          <NowPlayingBar refreshCurrentLyrics={refreshCurrentLyrics}  addToLiked={addToLikedSongs} track={currentTrack} currentLyrics={currentLyrics} plainLyrics={plainLyrics} pauseFunc={pauseTrack} playFunc={playTrack} prevFunc={playPrev} nextFunc={playNext} getCurrentPlayingTrack={getCurrentPlayingTrack}/>
        </>
      )}
    </div>
  );
}

function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop()!.split(';').shift()!);
  return '';
}
