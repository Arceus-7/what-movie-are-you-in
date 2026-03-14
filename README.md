# What Movie Are You In Right Now

A web application that utilizes artificial intelligence to re-contextualize user-captured photographs as fictional cinematic scenes. 

## Overview

This application prompts the user to capture or upload a photograph of their current environment. It processes the image locally (applying cinematic visual effects such as desaturation and film grain) and transmits it to a backend proxy. The proxy interfaces with the Google Gemini 1.5 Flash vision model to dynamically generate a detailed JSON "scene card." This data is then formatted into an exportable, stylized overlay resembling a film festival program insert or VHS cover.

## Architecture

The project is built with React and Vite, utilizing a serverless architecture intended for deployment on Netlify.

- **Frontend**: React (Vite). Handles camera streams, `<canvas>` image manipulation, state management, and cinematic UI rendering.
- **Backend**: Netlify Serverless Functions (`netlify/functions`). Acts as a secure proxy to interact with the Google Generative AI API, ensuring the necessary API keys remain hidden from the client application.
- **Styling**: Vanilla CSS, utilizing hardcoded design tokens for absolute control over the vintage aesthetic.
- **Utilities**: `html2canvas` for exporting the final composed Scene Card as an image, and `howler.js` for audio cues.

## Installation and Local Development

To run this application locally, you must utilize the Netlify CLI to simulate the serverless function environment.

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd what-movie-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure environment variables:**
    Copy the `.env.example` file to `.env` and provide your Google Gemini API Key.
    ```bash
    cp .env.example .env
    ```
    Ensure `GEMINI_API_KEY` is set within the new `.env` file.

4.  **Install Netlify CLI (if not already installed):**
    ```bash
    npm install -g netlify-cli
    ```

5.  **Start the local development server:**
    ```bash
    netlify dev
    ```
    This command starts both the Vite frontend server and local instances of the backend functions, automatically proxying `/api` or `/.netlify/functions` requests.

## Usage

1.  Grant the application camera permissions when prompted.
2.  Align the shot within the letterbox guides.
3.  Capture the image.
4.  Wait for the server to process the API request and return the structured scene data.
5.  View the generated Scene Card.
6.  (Optional) Click "Save Stills" to export a PNG composite of the image and the generated metadata.

## Disclaimer

This project was built primarily for fun and exploration. It was created with the assistance of "vibecoding"—using AI to generate and refine parts of the codebase, as I am not entirely proficient in JSX, React, or Vite build configurations. As such, the code may contain unconventional patterns or structure, but since it gets the job done I did not bother refining it further, any comments or suggestions are welcome where I can improve it.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
