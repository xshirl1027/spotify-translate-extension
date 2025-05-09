from flask import Flask, request, jsonify
import lyricsgenius

app = Flask(__name__)


@app.route("/get-lyrics", methods=["GET"])
def get_lyrics():
    # Initialize Genius API client

    song_title = request.args.get("song_title")
    artist_name = request.args.get("artist_name")
    GENIUS_ACCESS_TOKEN = request.args.get("token")  # Replace with your Genius API token
    genius = lyricsgenius.Genius(GENIUS_ACCESS_TOKEN)

    if not song_title or not artist_name:
        return jsonify({"error": "Missing song_title or artist_name"}), 400

    try:
        song = genius.search_song(song_title, artist_name)
        if song:
            return jsonify({"lyrics": song.lyrics})
        else:
            return jsonify({"error": "Lyrics not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)