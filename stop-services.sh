#!/bin/bash

# Stop the React frontend
if [ -f frontend.pid ]; then
  FRONTEND_PID=$(cat frontend.pid)
  echo "Stopping React frontend (PID: $FRONTEND_PID)..."
  kill $FRONTEND_PID
  rm frontend.pid
else
  echo "No frontend process found."
fi

# Stop the Flask backend
if [ -f backend.pid ]; then
  BACKEND_PID=$(cat backend.pid)
  echo "Stopping Flask backend (PID: $BACKEND_PID)..."
  kill $BACKEND_PID
  rm backend.pid
else
  echo "No backend process found."
fi

echo "All services stopped."