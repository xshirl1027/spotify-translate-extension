import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import SearchBar from "../components/searchbar/searchBar";
import { fireEvent } from "@testing-library/react";

describe("SearchBar Component", () => {
  it("renders the search input", () => {
    render(<SearchBar />);
    const searchInput = screen.getByPlaceholderText("Search tracks...");
    expect(searchInput).toBeInTheDocument();
  });
  it("on input change, updates the search term", () => {
    render(<SearchBar />);
    const searchInput = screen.getByPlaceholderText("Search tracks...");
    fireEvent.change(searchInput, { target: { value: "test" } });
    expect(searchInput.value).toBe("test");
  });
  it("on search term update, calls the onSearch function", () => {
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} />);
    const searchInput = screen.getByPlaceholderText("Search tracks...");
    fireEvent.change(searchInput, { target: { value: "test" } });
    const searchButton = screen.getByText("Search");
    fireEvent.click(searchButton);
    expect(mockOnSearch).toHaveBeenCalledWith("test");
  });
});
