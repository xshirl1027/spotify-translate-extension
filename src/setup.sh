if [ -d "venv" ]; then
  echo "Activating virtual environment..."
  source venv/bin/activate
else
  echo "Creating a virtual environment..."
  python3 -m venv venv
  source venv/bin/activate
fi

# Install required Python packages
echo "Installing required Python packages..."
pip install --upgrade pip
pip install flask flask-cors lyricsgenius

# Start the Flask backend
echo "Starting Flask backend..."
python src/app.py