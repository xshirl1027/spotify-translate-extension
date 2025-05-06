import SearchResults from '../components/searchResults/searchResults';
import Playlist from '../components/playlist/playlist';
import SearchBar from '../components/searchBar/searchBar';
import styles from './page.module.css';
import { useEffect, useState } from 'react';
import ACCESS from '../utils/apiUtils';
import { generateRandomString, makeApiRequest } from '../utils/apiUtils'; // Import utilities
import { headers } from 'next/headers';

const { CLIENT_ID, CLIENT_SECRET, GENIUS_CLIENT_ID, GENIUS_CLIENT_SECRET } = ACCESS;

export default function App() {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [custom_playlist, setCustomPlaylist] = useState<any[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [username, setUserName] = useState<string>('User');
  const [userId, setUserId] = useState<string | null>(null);
  const [playlistId, setPlaylistId] = useState<string | null>(null);
  const [geniusToken, setGeniusToken] = useState<string | null>(null);

  // Function to handle searching
  const handleSearch = async (searchTerm: string) => {
    if (!searchTerm || !token) return;

    setLoading(true);
    setError(null);

    try {
      const searchEndpoint = `https://api.spotify.com/v1/search?q=${encodeURIComponent(
        searchTerm
      )}&type=track,artist,album&limit=10`;

      const data = await makeApiRequest(searchEndpoint, 'GET', token);
      setSearchResults(data.tracks?.items || []); // Adjust based on the response structure
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
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

      let headers={
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`, // Base64 encode client_id:client_secret
        };
        
      let body= new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: 'https://3.96.206.67:3000/callback', // Same redirect URI used in handleLogin
      });

      let data = await makeApiRequest('https://api.spotify.com/api/token', 'POST', {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }, body);
      setToken(data.access_token); // Save the access token in state
      console.log('Access Token:', data.access_token);
    } catch (error: any) {
      console.error('Error exchanging authorization code for token:', error.message);
      console.error('error details:', error);
    }
  };

  const handleLogin = () => {
    const client_id = CLIENT_ID; // Replace with your Spotify client ID
    const redirect_uri = 'https://3.96.206.67:3000/callback'; // Replace with your registered redirect URI
    const state = generateRandomString(16);
    const scope = 'user-read-private user-read-email playlist-modify-private playlist-modify-public';

    const authUrl = `https://accounts.spotify.com/authorize?` +
      new URLSearchParams({
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state,
      }).toString();

    // Redirect the user to Spotify's authorization page
    window.location.href = authUrl;
  };

  const fetchSpotifyUsername = async () => {
    if (!token) return;

    try {
      const data = await makeApiRequest('https://api.spotify.com/v1/me', 'GET', {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      });
      setUserName(data.display_name); // Set the username or a default value
      setUserId(data.id); // Set the user ID or a default value
      console.log('User ID:', data.id);
    } catch (error: any) {
      console.error('Error fetching Spotify username:', error.message);
    }
  };

  const fetchGeniusToken = async () => {
    try {
      let headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${btoa(`${GENIUS_CLIENT_ID}:${GENIUS_CLIENT_SECRET}`)}`, // Base64 encode client_id:client_secret
      }
      let responseJson = await makeApiRequest('https://api.genius.com/oauth/token', 'POST', headers, {
        client_id: GENIUS_CLIENT_ID,
        client_secret: GENIUS_CLIENT_SECRET,
        grant_type: 'client_credentials',
      });
      setGeniusToken(responseJson.access_token);
      console.log('Genius Token:', responseJson.access_token);
    } catch (error: any) {
      console.error('Error fetching Genius token:', error.message);
    }
  };

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
  // function to save playlist to spotify
  // make request to create a new playlist
  // and add tracks to it
  const savePlaylist = async (playlistName:string) => {
    try{
      if (!token || custom_playlist.length === 0) return;
      if(!playlistName) {
        alert('Please enter a playlist name');
        return;
      }
      setLoading(true);
      setError(null);
      let playlistEndpoint='';
      let requestType='POST';
      let tempPlaylistId=playlistId;
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      // Check if playlistId is already set
      // If it is, update the existing playlist
      // If not, create a new playlist
      const createPlaylist = async () => {
        const createPlaylistEndpoint = `https://api.spotify.com/v1/users/${userId}/playlists`;
        const createPlaylistData = {
          name: playlistName,
          description: 'Playlist created using Spotify Translate',
          public: false,
        };
        const response = await makeApiRequest(createPlaylistEndpoint, 'POST', headers, createPlaylistData);
        return response.id;
      };

      const updatePlaylist = async () => {
        const updatePlaylistEndpoint = `https://api.spotify.com/v1/playlists/${playlistId}`;
        const updatePlaylistData = {
          name: playlistName,
          description: 'Playlist created using Spotify Translate',
          public: false,
        };
        await makeApiRequest(updatePlaylistEndpoint, 'PUT', headers, updatePlaylistData);
      };

      if(playlistId){
        requestType='PUT';
        updatePlaylist();
      }else{
        tempPlaylistId= await createPlaylist();
        setPlaylistId(tempPlaylistId);
      }
      const trackUris = custom_playlist.map((track) => track.uri);
      const addTracksEndpoint = `https://api.spotify.com/v1/playlists/${tempPlaylistId}/tracks`;
      const addTracksData = {
        uris: trackUris,
        position: 0,
      };
      console.log('Token:', token);
      console.log('Endpoint:', playlistEndpoint);
      console.log('Request Body:', addTracksData);
      await makeApiRequest(addTracksEndpoint, 'POST', headers, addTracksData);
      console.log('Playlist saved successfully!');
      if(requestType == 'PUT'){
        return 'playlist updated';
      }
      return 'playlist created';
    } catch (error: any) {
      console.error('Error saving playlist:', error.message);
      setError(error.message);
      return error;
    }
  };


  useEffect(() => {
    if (token) {
      fetchSpotifyUsername();
    }
  }, [token]);

  useEffect(() => {
    if (window.location.pathname === '/callback') {
      handleCallback();
      fetchGeniusToken();
    }
  }, []);
  

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
            <SearchResults searchResults={searchResults} onTrackClick={onTrackClick} />
            <Playlist playlistId={playlistId} playlist={custom_playlist} onTrackClick={onTrackRemove} onPlaylistSave={savePlaylist} />
          </div>
        </>
      )}
    </div>
  );
}
