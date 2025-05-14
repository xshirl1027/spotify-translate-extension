#!/bin/bash
# Start the React frontend
echo "Starting React frontend..."
npm start > frontend.log 2>&1 & # Run npm start in the background
FRONTEND_PID=$! # Save the process ID of the frontend

# Save the process IDs to a file
echo $FRONTEND_PID > frontend.pid
echo $BACKEND_PID > backend.pid

echo "React frontend (PID: $FRONTEND_PID) and Flask backend (PID: $BACKEND_PID) are running."