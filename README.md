# SafeAnalyst - Data Sanitization Tool

SafeAnalyst is a privacy-focused web application designed for business and system analysts. It allows users to safely sanitize text containing sensitive information (such as personal names, IP addresses, API keys, and hostnames) before sharing it with third parties or AI tools.

## Key Features

*   **Sensitive Data Masking**: Replace sensitive entities with mocked tokens (e.g., `[PERSON_1]`, `192.168.x.1`).
*   **Customizable Rules**: Define your own replacement values for specific text.
*   **Rule Management**: Undo/Redo support for rule changes.
*   **Categories**: specialized mocks for Hosts, System Names, Social Handles, Dates, Locations, and more.
*   **Persistence**: Save and Load anonymization configurations (`.json`) to reuse mappings across sessions.
*   **Sanitized Preview**: Real-time highlighting of sanitized data with one-click copy.
*   **Secure**: All processing happens client-side. No data is sent to external servers.

## Tech Stack

*   **Frontend**: React 18+
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **Icons**: Lucide React
*   **Build Tool**: Vite (for local/Docker deployment)

---

## Local Deployment with Docker

You can run this application locally using Docker to ensure an isolated and consistent environment.

### Prerequisites

*   [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### 1. Build the Docker Image

Open your terminal (PowerShell) in the project root directory and run:

```powershell
docker build -t safe-analyst .
```

This command builds a production image using the multi-stage `Dockerfile`: it installs dependencies, runs `npm run build` (Vite), and packages the generated `dist/` into an Nginx image.

### 2. Run the Container

Once the build is complete, run the container and map port `8080` on your host to port `80` in the container:

```powershell
docker run --rm -p 8080:80 safe-analyst
```

### 3. Access the Application

Open your web browser and navigate to:

```text
http://localhost:8080
```

Notes:
- The included `nginx.conf` is SPA-friendly: it falls back to `index.html` for unknown routes and sets long cache headers for static assets.
- If you prefer a different port, change the left-hand side of `-p HOST_PORT:80` when running the container.

## Local Development (Without Docker)

If you prefer to run it with Node.js directly:

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Start the development server:
    ```bash
    npm run dev
    ```
3.  Open the link provided in the terminal (usually `http://localhost:5173`).
