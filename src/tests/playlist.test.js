test('Playlist component renders correctly', () => {
    const { getByTestId } = render(<Playlist />);
    const playlistElement = getByTestId('playlist');
    expect(playlistElement).toBeInTheDocument();
});

test('Playlist component behaves as expected', () => {
    const { getByText } = render(<Playlist />);
    const playButton = getByText('Play');
    fireEvent.click(playButton);
    expect(playButton).toHaveTextContent('Pause');
});