import React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import searchResults from "../components/searchResults";

test("Track component renders track information correctly", () => {
  const track = { id: 1, name: "Track 1", artist: "Artist 1" };
  render(<Track track={track} onTrackClick={() => {}} />);

  expect(screen.getByText("Track 1")).toBeInTheDocument();
  expect(screen.getByText("Artist 1")).toBeInTheDocument();
});
