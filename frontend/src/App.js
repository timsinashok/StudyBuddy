// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PDFUpload from './components/PDFUpload';
import QuizGenerator from './components/QuizGenerator';
import QuizTaker from './components/QuizTaker';
import AttemptHistory from './components/AttemptHistory';
import Navigation from './components/Navigation';
import GoogleSignIn from './components/GoogleSignIn';

function App() {
  const [currentPdfId, setCurrentPdfId] = useState(null);
  
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route 
              path="/login" 
              element={ <GoogleSignIn /> }
              />
            <Route 
              path="/" 
              element={<PDFUpload onUploadSuccess={setCurrentPdfId} />} 
            />
            <Route 
              path="/generate" 
              element={<QuizGenerator pdfId={currentPdfId} />} 
            />
            <Route 
              path="/quiz/:quizId" 
              element={<QuizTaker />} 
            />
            <Route 
              path="/history" 
              element={<AttemptHistory />} 
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;