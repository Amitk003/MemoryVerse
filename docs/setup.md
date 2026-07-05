# Setup Guide

## Prerequisites

- Python 3.11 or higher
- Node.js 18 or higher
- npm 9 or higher

## Backend Setup

1. Go to the backend folder:
   ```
   cd backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Mac/Linux: `source venv/bin/activate`

4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

5. Create a `.env` file from the example:
   ```
   copy .env.example .env
   ```

6. Open `.env` and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_actual_key_here
   ```

7. Start the backend server:
   ```
   uvicorn app.main:app --reload --port 8000
   ```

   The API will be available at `http://localhost:8000`

## Frontend Setup

1. Go to the frontend folder:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

## Getting a Gemini API Key

1. Go to https://aistudio.google.com/apikey
2. Click "Create API Key"
3. Copy the key and paste it in your `.env` file
