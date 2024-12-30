import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const QuizGenerator = () => {
  const [pdfs, setPdfs] = useState([]);
  const [selectedPdfId, setSelectedPdfId] = useState('');
  const [selectedPdfName, setSelectedPdfName] = useState('');
  const [numQuestions, setNumQuestions] = useState('5');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [existingQuestions, setExistingQuestions] = useState([]);
  const [incompleteQuiz, setIncompleteQuiz] = useState(null);
  const navigate = useNavigate();

  // Fetch PDFs on component mount
  useEffect(() => {
    const fetchPdfs = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/pdfs');
        console.log('Fetched PDFs:', response.data); // Debugging statement
        setPdfs(response.data);
      } catch (error) {
        console.error('Error fetching PDFs:', error); // Debugging statement
        setError('Failed to fetch PDFs. Please try again later.');
      }
    };
    fetchPdfs();
  }, []);

  // Fetch existing questions when PDF is selected
  useEffect(() => {
    const fetchExistingQuestions = async () => {
      if (!selectedPdfId) return;

      setLoading(true);
      try {
        // Fetch questions for the selected PDF
        const pdfQuizzesResponse = await axios.get(`http://localhost:8000/api/quizzes/pdf/${selectedPdfId}`);
        const pdfQuizzes = pdfQuizzesResponse.data;

        console.log('Fetched PDF Quizzes:', pdfQuizzes); // Debugging statement

        if (!Array.isArray(pdfQuizzes)) {
          throw new Error('Expected an array of quizzes');
        }

        const quizWithSubmissions = await Promise.all(
          pdfQuizzes.map(async (quiz) => {
            try {
              // Fetch the user's attempts
              const attemptsResponse = await axios.get(`http://localhost:8000/api/user-attempts/test-user`);
              console.log('User Attempts:', attemptsResponse.data); // Debugging statement
              const userAttempts = attemptsResponse.data;

              // Find the attempt related to the current question
              const relatedAttempt = userAttempts.find(attempt => attempt.quiz_id === quiz._id);

              // If an attempt is found, use its data
              if (relatedAttempt) {
                return {
                  ...quiz,
                  submission: relatedAttempt,
                  hasSubmission: true
                };
              } else {
                // If no attempt is found, return the question with no submission
                return {
                  ...quiz,
                  submission: null,
                  hasSubmission: false
                };
              }
            } catch (error) {
              return {
                ...quiz,
                submission: null,
                hasSubmission: false
              };
            }
          })
        );

        // Find the first incomplete quiz
        const incomplete = quizWithSubmissions.find(q => !q.hasSubmission);
        if (incomplete) {
          // Fetch complete quiz details
          console.log('incomplete:', incomplete); // Debugging statement
          const quizResponse = await axios.get(`http://localhost:8000/api/quizzes/${incomplete._id}`);
          setIncompleteQuiz(quizResponse.data);
        } else {
          setIncompleteQuiz(null);
        }

        setExistingQuestions(quizWithSubmissions);
      } catch (error) {
        console.error('Error fetching existing questions:', error); // Debugging statement
        setError('Failed to fetch existing questions.');
      } finally {
        setLoading(false);
      }
    };

    fetchExistingQuestions();
  }, [selectedPdfId]);

  const handlePdfSelect = (e) => {
    const pdfId = e.target.value;
    setSelectedPdfId(pdfId);
    const selectedPdf = pdfs.find(pdf => pdf.id === pdfId);
    setSelectedPdfName(selectedPdf ? selectedPdf.filename : '');
    console.log('Selected PDF ID:', pdfId); // Debugging statement
    console.log('Selected PDF Name:', selectedPdf ? selectedPdf.filename : ''); // Debugging statement
  };

  const handleGenerate = async () => {
    if (!selectedPdfId) {
      setError('Please select a PDF first');
      return;
    }

    // Check for incomplete submissions
    const hasIncompleteQuiz = existingQuestions.some(quiz => !quiz.hasSubmission);
    if (hasIncompleteQuiz) {
      setError('There are questions without submissions. Please complete them first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get the most recent questions and their submissions
      const previousQuestions = existingQuestions.slice(-5); // Get last 5 questions

      const requestData = {
        pdf_id: selectedPdfId,
        num_questions: parseInt(numQuestions),
        previous_questions: previousQuestions.map(q => ({
          question_id: q._id,
          question_text: q.text,
          student_answer: q.submission?.answer,
          correct_answer: q.correct_answer,
          was_correct: q.submission?.was_correct
        }))
      };

      const response = await axios.post('http://localhost:8000/api/generate-quiz', requestData);
      navigate(`/quiz/${response.data.quiz_id}`);
    } catch (error) {
      console.error('Error generating quiz:', error); // Debugging statement
      setError(error.response?.data?.detail || 'Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueQuiz = () => {
    if (incompleteQuiz) {
      navigate(`/quiz/${incompleteQuiz._id}`);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Quiz Generator</h1>

      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
          Select a PDF:
        </label>
        <select
          value={selectedPdfId}
          onChange={handlePdfSelect}
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #d1d5db'
          }}
        >
          <option value="">-- Select PDF --</option>
          {pdfs.map((pdf) => (
            <option key={pdf.id} value={pdf.id}>
              {pdf.filename}
            </option>
          ))}
        </select>
      </div>

      {selectedPdfId && incompleteQuiz && (
        <div style={{
          backgroundColor: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '4px',
          padding: '15px',
          marginBottom: '20px'
        }}>
          <h3 style={{ fontSize: '16px', color: '#b45309', marginBottom: '10px' }}>
            You have an incomplete quiz!
          </h3>
          <p style={{ marginBottom: '10px' }}>
            Please complete your existing quiz before generating new questions.
          </p>
          <button
            onClick={handleContinueQuiz}
            style={{
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              cursor: 'pointer'
            }}
          >
            Continue Previous Quiz
          </button>
        </div>
      )}

      {selectedPdfId && (
        <>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>
              Existing Questions for: {selectedPdfName}
            </h3>
            {existingQuestions.length === 0 ? (
              <p>No existing questions found. You can generate new ones.</p>
            ) : (
              <div style={{ border: '1px solid #d1d5db', borderRadius: '4px', padding: '10px' }}>
                {existingQuestions.map((question, index) => (
                  <div
                    key={question._id}
                    style={{
                      padding: '10px',
                      borderBottom: index < existingQuestions.length - 1 ? '1px solid #d1d5db' : 'none'
                    }}
                  >
                    <p style={{ marginBottom: '8px' }}>{question.text}</p>
                    <div style={{
                      fontSize: '14px',
                      color: question.hasSubmission ? '#059669' : '#dc2626'
                    }}>
                      {question.hasSubmission ? (
                        <span>✓ Submitted - Score: {question.submission.score}%</span>
                      ) : (
                        <span>{question._id} ⚠ No submission yet</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Number of New Questions:
            </label>
            <input
              type="number"
              min="1"
              value={numQuestions}
              onChange={(e) => setNumQuestions(e.target.value)}
              style={{
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #d1d5db',
                width: '120px'
              }}
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || existingQuestions.some(q => !q.hasSubmission)}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: loading || existingQuestions.some(q => !q.hasSubmission)
                ? '#9ca3af'
                : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading || existingQuestions.some(q => !q.hasSubmission)
                ? 'not-allowed'
                : 'pointer'
            }}
          >
            {loading ? 'Generating...' : 'Generate New Questions'}
          </button>
        </>
      )}
    </div>
  );
};

export default QuizGenerator;

