import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Tracklist from "../components/tracklist";

test("renders Tracklist component correctly", () => {
  render(<Tracklist tracklist={[]} onTrackClick={() => {}} />);
  const tracklistElement = screen.getByText("No tracks available");
  expect(tracklistElement).toBeInTheDocument();
});

test("displays a list of tracks", () => {
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
  render(<Tracklist tracklist={tracks} onTrackClick={() => {}} />);
  const trackElements = screen.getAllByRole("heading", { level: 3 });
  expect(trackElements.length).toBe(tracks.length);
});

// test("handles track click interactions", () => {
//   const mockOnTrackClick = jest.fn();
//   const tracks = [{ id: 1, name: "Track 1", artist: "Artist 1" }];
//   render(<Tracklist tracklist={tracks} onTrackClick={mockOnTrackClick} />);
//   const trackElement = screen.getByText("Track 1");

//   fireEvent.click(trackElement);
//   expect(mockOnTrackClick).toHaveBeenCalledWith(tracks[0]);
// });
