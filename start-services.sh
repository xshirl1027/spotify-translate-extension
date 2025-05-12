#!/bin/bash

# Check if Flask and Flask-CORS are installed
if ! pip show flask > /dev/null 2>&1 || ! pip show flask-cors > /dev/null 2>&1; then
  echo "Flask or Flask-CORS not found. Installing required packages..."
  pip install flask flask-cors
fi
# Start the Flask backend
echo "Starting Flask backend..."
. venv/bin/activate # Activate the Python virtual environment
python src/app.py > backend.log 2>&1 & # Run the Flask app in the background
BACKEND_PID=$! # Save the process ID of the backend

# Start the React frontend
echo "Starting React frontend..."
npm start > frontend.log 2>&1 & # Run npm start in the background
FRONTEND_PID=$! # Save the process ID of the frontend

# Save the process IDs to a file
echo $FRONTEND_PID > frontend.pid
echo $BACKEND_PID > backend.pid

echo "React frontend (PID: $FRONTEND_PID) and Flask backend (PID: $BACKEND_PID) are running."