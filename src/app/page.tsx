import SearchResults from '../components/searchResults/searchResults';
import Playlist from '../components/playlist/playlist';
import SearchBar from '../components/searchBar/searchBar';
import styles from './page.module.css';
import { useEffect, useState } from 'react';
import ACCESS from '../utils/apis';
const { AUTH_ENDPOINT, CLIENT_ID, CLIENT_SECRET } = ACCESS;
import { cn } from '../utils/styles';


export default function App() {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [custom_playlist, setCustomPlaylist] = useState<any[]>([]);
  const tracks = [
    {
      name: "Cowboy Like Me",
      artist: "Taylor Swift",
      album: "Evermore (deluxe version)",
      id: 123324123,
    },
    {
      name: "夜曲",
      artist: "Jay Chou",
      album: "11 月的蕭邦",
      id: 123324124,
    },
  ];
  const [token, setToken] = useState<string | null>(null);
   // Function to handle searching
  const handleSearch = async (searchTerm:string) => {
    if (!searchTerm || !token) return;

    setLoading(true);
    setError(null);

    try {
      const searchEndpoint = `https://api.spotify.com/v1/search?q=${encodeURIComponent(
        searchTerm
      )}&type=track,artist,album&limit=10`;

      const response = await fetch(searchEndpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSearchResults(data.tracks?.items || []); // Adjust based on the response structure
    } catch (error: any) {
      setError(error.message);
      const errorDetails = await error.json();
      console.error('error details:', errorDetails);

    } finally {
      setLoading(false);
    }
  };

const handleCallback = async () => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code'); // Get the authorization code from the URL
  const state = params.get('state'); // Optional: Validate the state parameter if used

  if (!code) {
    console.error('Authorization code not found');
    return;
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`, // Base64 encode client_id:client_secret
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: 'http://127.0.0.1:8888/callback', // Same redirect URI used in handleLogin
      }).toString(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    setToken(data.access_token); // Save the access token in state
    console.log('Access Token:', data.access_token);
  } catch (error: any) {
    console.error('Error exchanging authorization code for token:', error.message);
  }
};

// Use useEffect to handle the callback when the component loads
useEffect(() => {
  if (window.location.pathname === '/callback') {
    handleCallback();
  }
}, []);
  
  const handleLogin = () => {
    const generateRandomString = (length: number) => {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      return result;
    };

    const client_id = CLIENT_ID; // Replace with your Spotify client ID
    const redirect_uri = 'https://3.96.206.67:3000/callback'; // Replace with your registered redirect URI
    const state = generateRandomString(16);
    const scope = 'user-read-private user-read-email';

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
      const response = await fetch('https://api.spotify.com/v1/me', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Spotify Username:', data.display_name); // Replace with desired handling
    } catch (error: any) {
      console.error('Error fetching Spotify username:', error.message);
    }
  };

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

  // useEffect(() => {
  //   if (token) {
  //     fetchSpotifyUsername();
  //   }
  // }, [token]);

  return (
    <>
    {!token ? (
        <button onClick={handleLogin}>Login to Spotify</button>
      ) : (
        <div className={cn(
          'min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black',
          'flex flex-col items-center justify-start p-4 md:p-8'
        )}>
          <h1>Spotify App</h1>
          <SearchBar onSearch={handleSearch}/>
          <div className={styles.listContainer}>
            <SearchResults searchResults={searchResults} onTrackClick={onTrackClick}/>
            <Playlist playlist={custom_playlist} onTrackClick={onTrackRemove}/>
          </div>
        </div>
      )}
    </>
  );
}
