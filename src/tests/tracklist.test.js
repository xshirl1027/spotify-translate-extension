const { render, screen } = require("@testing-library/react");
const Tracklist = require("../components/Tracklist");

test("renders Tracklist component", () => {
  render(<Tracklist />);
  const linkElement = screen.getByText(/tracklist/i);
  expect(linkElement).toBeInTheDocument();
});

test("displays a list of tracks", () => {
  const tracks = [
    { id: 1, title: "Track 1" },
    { id: 2, title: "Track 2" },
  ];
  render(<Tracklist tracks={tracks} />);
  const trackElements = screen.getAllByRole("listitem");
  expect(trackElements.length).toBe(tracks.length);
});

test("handles interactions correctly", () => {
  const tracks = [{ id: 1, title: "Track 1" }];
  render(<Tracklist tracks={tracks} />);
  const trackElement = screen.getByText(/Track 1/i);
  trackElement.click();
  expect(trackElement).toHaveClass("active"); // Assuming clicking adds an 'active' class
});
