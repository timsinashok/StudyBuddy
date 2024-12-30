// src/components/AttemptHistory.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AttemptHistory = () => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/user-attempts/test-user');
        setAttempts(response.data);
      } catch (error) {
        console.error('Failed to fetch attempts:', error);
      }
      setLoading(false);
    };

    fetchAttempts();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Your Quiz Attempts</h2>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Questions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {attempts.map((attempt) => (
              <tr key={attempt._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {attempt.quiz_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(attempt.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {attempt.score.toFixed(1)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {attempt.answers.length} questions
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttemptHistory;
