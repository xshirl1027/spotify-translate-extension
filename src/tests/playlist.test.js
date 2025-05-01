import React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Playlist from "../components/playlist";

test("Playlist component renders correctly", () => {
  render(<Playlist playlist={[]} onTrackClick={() => {}} />);
  const playlistElement = screen.getByText("No playlist available");
  expect(playlistElement).toBeInTheDocument();
});

test("Playlist component handles play button click", () => {
  const mockOnTrackClick = jest.fn();
  const playlist = [{ id: 1, name: "Track 1", artist: "Artist 1" }];
  render(<Playlist playlist={playlist} onTrackClick={mockOnTrackClick} />);
  const trackElement = screen.getByText("Track 1");

  fireEvent.click(trackElement);
  expect(mockOnTrackClick).toHaveBeenCalledWith(playlist[0]);
});
