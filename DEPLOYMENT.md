# Deployment Instructions

## Prerequisites
- Docker and Docker Compose installed.
- Node.js installed (for local development).

## Running with Docker Compose (Recommended)

1.  **Build and Start Containers**:
    ```bash
    docker-compose up --build -d
    ```

2.  **Run Database Migrations**:
    ```bash
    docker-compose exec backend npx prisma migrate deploy
    ```

3.  **Access the Application**:
    -   Frontend: [http://localhost:3000](http://localhost:3000)
    -   Backend: [http://localhost:3001](http://localhost:3001)

## Manual Deployment

### Backend
1.  Navigate to `backend` directory.
2.  Install dependencies: `npm install`.
3.  Build the project: `npm run build`.
4.  Start the server: `npm start`.

### Frontend
1.  Navigate to `frontend` directory.
2.  Install dependencies: `npm install`.
3.  Build the project: `npm run build`.
4.  Start the server: `npm start`.

## Environment Variables
Ensure `.env` files are configured correctly or environment variables are passed to the containers/processes.
