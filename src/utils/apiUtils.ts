const token =
  "BQC0obFf13svyAFNJQ3l7OWBrftibnHenhfJS9GlxpvIP6UUcouURnxxlt8NGosVA3Lw6U9Qqicd3iSdwz2AIfINMl0Fb5ZJlwhjFzNcRg2_KRyos7VL1ReYbh-u2ftR-2gjo_LZMXzw81GD3vfMuDXlKQVp5nHeS3h6brmeRbeoszbVgI9TOYEPOwNCkZ2Rvhh61Q33MFiKlefqWQEHnILIDqD7wOgR6ADv8ColmSJlwt670WDgsGrz84hbsUPjpFuGOnYUmklkh1mEicH-vaZXrZ1uNCDs3k6SbWpL9u36ma_N0TgiVcAYsXVrzCXXdLAm";
const CLIENT_ID = "f5a9264d7cbf4bbfaabcbc7c9da36665";
const CLIENT_SECRET = "7fef90afbbd24540b17acc461c335345";
const AUTH_ENDPOINT = "https://accounts.spotify.com/api/token";
const scope = 'playlist-modify-private playlist-modify-public';

/**
 * Generates a random string of the specified length.
 */
export const generateRandomString = (length: number): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

/**
 * Makes an API request with the given endpoint, method, and headers.
 */
export const makeApiRequest = async (
  endpoint: string,
  method: string,
  token: string | null,
  body?: Record<string, any>
): Promise<any> => {
    if (!token) {
      throw new Error('No token provided');
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(endpoint, options);

    if (!response.ok) {
      const errorDetails = await response.json();
      throw new Error(`HTTP error: ${response.status} - ${errorDetails.stringify()}`);
    }
    return response.json();

};


export default {
  CLIENT_ID: CLIENT_ID,
  CLIENT_SECRET: CLIENT_SECRET,
  AUTH_ENDPOINT: AUTH_ENDPOINT,
};
