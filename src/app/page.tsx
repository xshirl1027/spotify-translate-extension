import SearchResults from '../components/searchResults/searchResults';
import Playlist from '../components/playlist/playlist';
import SearchBar from '../components/searchBar/searchBar';
import styles from './page.module.css';
import { useEffect, useState } from 'react';
import ACCESS from '../utils/apiUtils';
import { generateRandomString, makeApiRequest, createPlaylist, updatePlaylistItems, updatePlaylistName } from '../utils/apiUtils'; // Import utilities
import Genius from 'genius-lyrics'; // Import Genius API client

const { CLIENT_ID, CLIENT_SECRET, GENIUS_CLIENT_ID, GENIUS_CLIENT_SECRET, SCOPE } = ACCESS;

export default function App() {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [username, setUserName] = useState<string>('User');
  const [userId, setUserId] = useState<string | null>(null);
  const [custom_playlist, setCustomPlaylist] = useState<any[]>([]);
  const [playlistId, setPlaylistId] = useState<string | null>(null);
  const [geniusToken, setGeniusToken] = useState<string | null>(null);
  const [prevSaveReq, setPrevSaveReq] = useState<{ playlistName: string; trackUris: string[] }>({ playlistName: '', trackUris: [] }); // to store the previous request
  const [trackCickDisabled, setTrackClickDisabled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = () => {
    const redirect_uri = 'https://3.96.206.67:3000/callback'; // Replace with your registered redirect URI
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
          redirect_uri: 'https://3.96.206.67:3000/callback', // Same redirect URI used in handleLogin
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

  const fetchGeniusToken = async () => {
    try {
      let responseJson = await makeApiRequest('https://api.genius.com/oauth/token?'+ new URLSearchParams({
        client_id: GENIUS_CLIENT_ID,
        client_secret: GENIUS_CLIENT_SECRET,
        grant_type: 'client_credentials',
      }).toString(), 'POST', {});
      setGeniusToken(responseJson.access_token);
      console.log('Genius Token:', responseJson.access_token);
    } catch (error: any) {
      setError(error.message);
      console.error('Error fetching Genius token:', error.message);
    }
  };

  const getGeniusLyricsForSong = async (songTitle: string, artistName: string) => {
    const Client = new Genius.Client(geniusToken || undefined); // Scrapes if no key is provided
    const searches = await Client.songs.search(songTitle + ' ' + artistName);

    // Pick first one
    const firstSong = searches[0];
    console.log("About the Song:\n", firstSong, "\n");
    
    // Ok lets get the lyrics
    const lyrics = await firstSong.lyrics();
    console.log("Lyrics of the Song:\n", lyrics, "\n");

  }

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
        };
        console.log(currentPlayingTrack);
        return currentPlayingTrack;
      } else {
        console.log('No track is currently playing');
      }
    } catch (error: any) {
      setError(error.message);
      console.error('Error fetching currently playing track:', error.message);
    }
  };


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
    if (token) {
      fetchSpotifyUser();
      const currentplaying = getCurrentPlayingTrack();
      getGeniusLyricsForSong(currentplaying.name, currentplaying.artists);
    }
  }, [token]);

  useEffect(() => {
    if (window.location.pathname === '/callback') {
      handleCallback();
      fetchGeniusToken();
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
            <SearchResults searchResults={searchResults} onTrackClick={onTrackClick} trackClickDisabled={trackCickDisabled} />
            <Playlist playlistId={playlistId} playlist={custom_playlist} onTrackClick={onTrackRemove} onPlaylistSave={savePlaylist} trackClickDisabled={trackCickDisabled} setTrackClickDisabled={setTrackClickDisabled}/>
          </div>
        </>
      )}
    </div>
  );
}
