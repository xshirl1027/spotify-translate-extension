import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import SearchBar from "../components/searchbar/searchBar";
import { fireEvent } from "@testing-library/react";

describe("SearchBar Component", () => {
  it("renders the search input", () => {
    render(<SearchBar onSearch={() => {}} />);
    const searchInput = screen.getByPlaceholderText("Search tracks...");
    expect(searchInput).toBeInTheDocument();
  });
  it("on input change, updates the search term", () => {
    let onSearchCalled = false;
    render(
      <SearchBar
        onSearch={() => {
          onSearchCalled = true;
        }}
      />
    );
    const searchInput = screen.getByPlaceholderText("Search tracks...");
    fireEvent.change(searchInput, { target: { value: "test" } });
    expect(searchInput.value).toBe("test");
    expect(onSearchCalled).toBe(true);
  });
});
