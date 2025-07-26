# STATIFY

A simple game where you test your knowledge of music popularity. Guess which of two Spotify songs is more popular and see how high you can score.

## Features

*   **Spotify Authentication:** Securely log in with your Spotify account.
*   **Guess the Popularity:** Compare two random songs and guess which one has a higher popularity score on Spotify.
*   **Score Tracking:** Keep track of your score as you play.
*   **Game Over State:** The game ends when you guess incorrectly.

## Tech Stack

*   **Frontend:**
    *   React
    *   Tailwind CSS
*   **Backend:**
    *   Express.js (for Spotify authentication)

## Getting Started

### Prerequisites

*   Node.js and npm installed on your machine.
*   A Spotify Developer account and a registered application to get your client ID and client secret.

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/PawiX25/Statify
    ```
2.  Install the dependencies:
    ```bash
    npm install
    ```
3. Create a `.env` file in the root directory and add your Spotify API credentials:
    ```
    CLIENT_ID=your_spotify_client_id
    CLIENT_SECRET=your_spotify_client_secret
    REDIRECT_URI=http://127.0.0.1:8888/callback
    ```
4.  Start the development server:
    ```bash
    npm run dev
    ```
This will start both the React development server and the Express.js authentication server.
