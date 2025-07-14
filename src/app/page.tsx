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
        client_id: process.env.REACT_APP_CLIENT_ID ?? '',
        scope: SCOPE,
        redirect_uri: redirect_uri,
        state: state,
      } as Record<string, string>).toString();
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
          Authorization: `Basic ${btoa(`${process.env.REACT_APP_CLIENT_ID}:${process.env.REACT_APP_CLIENT_SECRET}`)}`, // Base64 encode client_id:client_secret
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
            'x-cors-api-key': 'live_285dcea35de0512813821dab5d30988a0fe9a0c52a8ae0ddd0dd5ee9ceec8bad',
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
          alert("you'll have to guess the lyrics for this one.");     
        }
      }
      } catch (error) {
        alert("No lyrics found for this song");
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
    if (currentTrack && timeStampedLyrics && timeStampedLyrics.length > 0) {
      const { progress_ms } = currentTrack;
      const latestLyrics = getCurrentLyrics(timeStampedLyrics, progress_ms, currentLyrics);
      if (JSON.stringify(latestLyrics)!=JSON.stringify(currentLyrics)) {
        // setTimeout(() => {
        //   setCurrentLyrics(latestLyrics);
        // }, 150);
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
          <button
            onClick={handleLogin}
            style={{ marginTop: "10px" }}
          >
            Login to Spotify
          </button>
        ) : (
          <p>hello {username.toLocaleLowerCase()}</p>
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
            <h1>Currently under construction, please come back in a few days! thank you 😊</h1>
            <h2>Unlock the World of Foreign Music with Spotify-Translate!</h2>
            Have you ever vibed to a K-Pop or Spanish song on Spotify and wish you understood the lyrics, only to find that there is no translation function? Fret not! Spotify-Translate is an simple easy-to-use app extension that displays real-time lyrics that can be viewed and translated into almost any language, including English, French, Russian, and Chinese, all while your song is playing.
            Our website is completely secure, backed by GoDaddy's best security package, and mobile-compatible (android only for now) so you can log in with confidence. Simply connect your Spotify account and unlock your favorite foreign language songs in totally new ways.
          </div>
        </>
      ) : (
        <>
          <SearchBar onSearch={handleSearch} />
          <div className={styles.listContainer}>
            <SearchResults addToLiked={addToLikedSongs} searchResults={searchResults} onTrackClick={onTrackClick} trackClickDisabled={trackCickDisabled} onTrackPlay={playTrack}/>
            <Playlist playlistId={playlistId} playlist={custom_playlist} onTrackAdd={onTrackRemove} onPlaylistSave={savePlaylist} trackClickDisabled={trackCickDisabled} setTrackClickDisabled={setTrackClickDisabled} onTrackPlay={playTrack}/>
          </div>
          <NowPlayingBar refreshCurrentLyrics={refreshCurrentLyrics}  addToLiked={addToLikedSongs} track={currentTrack} currentLyrics={currentLyrics} plainLyrics={plainLyrics} pauseFunc={pauseTrack} playFunc={playTrack} prevFunc={playPrev} nextFunc={playNext} getCurrentPlayingTrack={getCurrentPlayingTrack}/>
        </>
      )}
    </div>
  );
}
