import React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import SearchResults from "../components/searchResults";

test("displays correct results based on input", () => {
  const results = [
    { id: 1, name: "Result 1", artist: "Artist 1" },
    { id: 2, name: "Result 2", artist: "Artist 2" },
  ];
  render(<SearchResults results={results} onTrackClick={() => {}} />);

  expect(screen.getByText("Result 1")).toBeInTheDocument();
  expect(screen.getByText("Result 2")).toBeInTheDocument();
});
