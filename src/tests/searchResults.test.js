const { render, screen } = require("@testing-library/react");
const SearchResults = require("../components/SearchResults");

test("displays correct results based on input", () => {
  render(<SearchResults results={["Result 1", "Result 2"]} />);
  expect(screen.getByText("Result 1")).toBeInTheDocument();
  expect(screen.getByText("Result 2")).toBeInTheDocument();
});
