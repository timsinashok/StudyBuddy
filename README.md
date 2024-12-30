# Study Buddy

Study Buddy is a web application that allows users to upload PDFs, generate quizzes based on the content of the PDFs, and view their quiz history. The application uses FastAPI for the backend and React for the frontend.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [License](#license)

## Features

- Upload PDFs
- Generate quizzes based on PDF content
- View quiz history
- Google Sign-In for authentication

## Technologies Used

- **Backend:** FastAPI
- **Frontend:** React
- **Authentication:** Firebase (Google Sign-In)
- **Styling:** Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- mongoDB
- Cerebras API for question generation
- npm (v6 or later)
- Python (v3.7 or later)
- pip

### Installation

1. **Clone the repository:**

   ```sh
   git clone https://github.com/timsinashok/studybuddy.git
   cd studybuddy
   ```

2. **Set up the backend (FastAPI):**

   ```sh
   pip install -r requirements.txt
   ```

3. **Set up the frontend (React):**

   ```sh
   cd frontend
   npm install
   ```

4. **Create a `.env` file in the root directory and the `/frontend` directory with the following content:**

    - In the root directory:

   ```env
    CEREBRAS_API_KEY=your_cerebras_api_key
    MONGODB_URL=your_mongodb_uri

   ```

    - In `/frontend` directory create .env file with following environment variables. These environment variable are for Firebase authentication.

   ```env
   REACT_APP_API_KEY=your_api_key
   REACT_APP_AUTH_DOMAIN=your_auth_domain
   REACT_APP_PROJECT_ID=your_project_id
   REACT_APP_STORAGE_BUCKET=your_storage_bucket
   REACT_APP_MESSAGING_SENDER_ID=your_messaging_sender_id
   REACT_APP_APP_ID=your_app_id
   REACT_APP_MEASUREMENT_ID=your_measurement_id
   ```

5. **Start the backend server:**

   ```sh
   cd backend
   uvicorn main:app --reload
   ```

6. **Start the frontend development server:**

   ```sh
   cd ../frontend
   npm start
   ```

## Usage

1. **Upload PDFs:**
   - Navigate to the "Upload PDF" page and upload your PDF files.

2. **Generate Quizzes:**
   - Navigate to the "Generate Quiz" page to create quizzes based on the uploaded PDFs.

3. **View Quiz History:**
   - Navigate to the "History" page to view your quiz history.

4. **Google Sign-In:**
   - Use the Google Sign-In button in the navigation bar to authenticate and access the application.

