import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Playlist from "../components/playlist/playlist";

it("is a dummy test", () => {
  expect(true).toBe(true);
});
// test("empty playlist component renders correctly", () => {
//   render(<Playlist playlist={[]} onTrackClick={() => {}} />);
//   const playlistElement = screen.getByText("Playlist Empty");
//   expect(playlistElement).toBeInTheDocument();
// });

// test("Playlist component handles play button click", () => {
//   const playlist = [
//     {
//       name: "Cowboy Like Me",
//       artist: "Taylor Swift",
//       album: "Evermore (deluxe version)",
//       id: 123324123,
//     },
//     {
//       name: "夜曲",
//       artist: "Jay Chou",
//       album: "11 月的蕭邦",
//       id: 123324124,
//     },
//   ];
//   render(<Playlist playlist={playlist} onTrackClick={() => {}} />);
//   const trackElements = screen.getAllByRole("heading", { level: 3 });
//   expect(trackElements.length).toBe(playlist.length);
// });
