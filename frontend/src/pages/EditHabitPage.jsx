// src/pages/EditHabitPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import HabitForm from '../components/Habits/HabitForm.jsx';
import { getHabitById } from '../services/api.js';

const EditHabitPage = () => {
  const { id } = useParams(); // Get habit ID from URL parameter
  const navigate = useNavigate();
  const [habitData, setHabitData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHabit = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await getHabitById(id);
        setHabitData(response.data);
      } catch (err) {
        console.error("Error fetching habit for edit:", err.response?.data || err.message);
        setError(err.response?.data?.message || 'Failed to load habit data. It might not exist or you may not have permission.');
        // Optional: Redirect if habit not found or not authorized
        if (err.response?.status === 404 || err.response?.status === 401) {
            // Maybe redirect after a delay or show message then redirect
            // navigate('/dashboard');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHabit();
  }, [id, navigate]); // Re-fetch if ID changes

  if (loading) {
    return <div className="loading-app">Loading Habit Details...</div>;
  }

  if (error) {
    return (
        <div className="error-container" style={{ padding: '2rem', textAlign: 'center' }}>
             <h2>Error</h2>
             <p className="error-message">{error}</p>
             <Link to="/dashboard">Back to Dashboard</Link>
        </div>
    );
  }

  if (!habitData) {
      // Should be covered by error state, but good fallback
      return <div style={{ padding: '2rem', textAlign: 'center' }}>Habit not found.</div>;
  }

  return (
    <div>
      {/* Pass the fetched data and isEditing flag to the form */}
      <HabitForm initialData={habitData} isEditing={true} />
    </div>
  );
};

export default EditHabitPage;