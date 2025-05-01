import React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import SearchBar from "../components/searchBar"; // Adjust the import path as necessary

test("SearchBar renders correctly", () => {
  render(<SearchBar onSearch={() => {}} />);
  const inputElement = screen.getByPlaceholderText("Search for a track...");
  expect(inputElement).toBeInTheDocument();
});

test("SearchBar handles user input", () => {
  const mockOnSearch = jest.fn();
  render(<SearchBar onSearch={mockOnSearch} />);
  const inputElement = screen.getByPlaceholderText("Search for a track...");
  const buttonElement = screen.getByText("Search");

  fireEvent.change(inputElement, { target: { value: "Test Track" } });
  fireEvent.click(buttonElement);

  expect(mockOnSearch).toHaveBeenCalledWith("Test Track");
});
