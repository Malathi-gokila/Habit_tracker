// src/components/Habits/HabitForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createHabit, updateHabit } from '../../services/api'; // Import API functions
import { toast } from 'react-toastify'; // Import for notifications
import { getBadgeDetails } from '../../config/badges'; // Import for badge notifications
import './HabitForm.css'; // Ensure CSS is linked

// Initial state helper
const getInitialState = (initialData = null) => ({
  name: initialData?.name || '',
  description: initialData?.description || '',
  points: initialData?.pointsPerCompletion || 10,
  color: initialData?.color || '#7f9cf5',
  icon: initialData?.icon || '🎯',
  // Frequency state
  frequencyType: initialData?.frequencyType || 'daily',
  frequencyDays: initialData?.frequencyDays || [], // Array of numbers 0-6
  frequencyTarget: initialData?.frequencyTarget || 3, // Default e.g., 3 times/week
  frequencyInterval: initialData?.frequencyInterval || 2, // Default e.g., every 2 days
  // frequencyStartDate: initialData?.frequencyStartDate || null, // Handle date input later if needed
});

const HabitForm = ({ initialData = null, isEditing = false }) => {
  
  // --- State Variables ---
  const [formData, setFormData] = useState(getInitialState(initialData));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // --- Effect to Populate Form for Editing ---
  useEffect(() => {
    setFormData(getInitialState(initialData));
    setError(''); // Clear errors on mode change/data load
  }, [initialData, isEditing]); // Dependencies for the effect


  // --- Input Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
};

const handleFrequencyTypeChange = (e) => {
     const newType = e.target.value;
     setFormData(prev => ({
         ...prev,
         frequencyType: newType,
         // Optionally reset other frequency fields when type changes
         frequencyDays: newType === 'specific_days' ? prev.frequencyDays : [],
         frequencyTarget: newType === 'times_per_week' ? prev.frequencyTarget : 3,
         frequencyInterval: newType === 'every_n_days' ? prev.frequencyInterval : 2,
     }));
};

const handleDaysChange = (dayValue) => {
     setFormData(prev => {
         const currentDays = prev.frequencyDays || [];
         const newDays = currentDays.includes(dayValue)
             ? currentDays.filter(d => d !== dayValue) // Remove day
             : [...currentDays, dayValue].sort((a,b) => a - b); // Add day and sort
         return { ...prev, frequencyDays: newDays };
     });
};
 // --- End Input Handlers ---


  // --- Handle Form Submission (Create or Update) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.name.trim()) { /* ... validation ... */ }
    setLoading(true);

    // Prepare data payload based on frequency type
    const { name, description, points, color, icon, frequencyType, frequencyDays, frequencyTarget, frequencyInterval } = formData;
    const apiData = {
        name: name.trim(),
        description: description.trim(),
        pointsPerCompletion: points, color, icon, frequencyType
    };

    switch (frequencyType) {
         case 'specific_days':
              if (!frequencyDays || frequencyDays.length === 0) { setError('Please select at least one day.'); setLoading(false); return; }
              apiData.frequencyDays = frequencyDays;
              break;
         case 'times_per_week':
              if (!frequencyTarget || frequencyTarget < 1 || frequencyTarget > 7) { setError('Please enter a valid target (1-7) for times per week.'); setLoading(false); return; }
              apiData.frequencyTarget = frequencyTarget;
              break;
         case 'every_n_days':
              if (!frequencyInterval || frequencyInterval < 1) { setError('Please enter a valid interval (>= 1) for every N days.'); setLoading(false); return; }
              apiData.frequencyInterval = frequencyInterval;
              // apiData.frequencyStartDate = ... // Send start date if implemented
              break;
         case 'daily': // No extra data needed
              break;
         default:
              setError('Invalid frequency type selected.'); setLoading(false); return;
    }


    try {
      if (isEditing) {
        await updateHabit(initialData._id, apiData);
        toast.success("Habit updated!");
      } else {
        const response = await createHabit(apiData);
        toast.success("Habit created!");
        // Check for first step challenge completion (existing logic)
         if (response.data.firstStepChallengeCompleted) { /* ... show toast ... */ }
      }
      navigate('/dashboard');
    } catch (err) {
         console.error(`Error ${isEditing ? 'updating' : 'creating'} habit:`, err);
         const errorMsg = err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} habit.`;
         setError(errorMsg);
         toast.error(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Available icons (customize as needed)
  const commonIcons = ['🎯', '💧', '💪', '📖', '🧘', '🚶', '🍎', '🥦', '☀️', '🌙', '💰', '🧹', '✍️', '🏃', '💡', '💤', '🏋️', '🌱', '⭐', '🏆', '🏅', '📅'];

  // --- Render Form JSX ---
  return (
    <form onSubmit={handleSubmit} className="habit-form">
      <h2>{isEditing ? 'Edit Habit' : 'Create New Habit'}</h2>
      {error && <p className="error-message">{error}</p>}

      {/* --- CORRECTED Form Fields --- */}
      <div className="form-group">
        <label htmlFor="name">Habit Name *</label>
        <input
          type="text"
          id="name"
          name="name" // Input 'name' attribute MUST match key in formData state
          value={formData.name} // <-- Access value from formData state
          onChange={handleInputChange} // <-- Use generic handler
          required
          disabled={loading}
          placeholder="e.g., Drink Water"
          maxLength={100}
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description (Optional)</label>
        <textarea
          id="description"
          name="description" // Input 'name' attribute
          value={formData.description} // <-- Access value from formData state
          onChange={handleInputChange} // <-- Use generic handler
          disabled={loading}
          placeholder="e.g., Drink 8 glasses daily"
          rows="3"
          maxLength={250}
        />
      </div>

      <div className="form-row">
        <div className="form-group form-group-points">
          <label htmlFor="points">Points</label>
          <input
            type="number"
            id="points"
            name="points" // Input 'name' attribute
            value={formData.points} // <-- Access value from formData state
            // Use specific logic or adjust handleInputChange if needed for parsing/min/max
            onChange={(e) => {
                // Keep specific logic here or adapt handleInputChange
                const value = Math.max(1, parseInt(e.target.value, 10) || 1);
                setFormData(prev => ({ ...prev, points: value }));
             }}
            min="1"
            max="100"
            disabled={loading}
            className="points-input"
          />
        </div>

        <div className="form-group form-group-color">
            <label htmlFor="color">Color</label>
            <input
              type="color"
              id="color"
              name="color" // Input 'name' attribute
              value={formData.color} // <-- Access value from formData state
              onChange={handleInputChange} // <-- Use generic handler
              disabled={loading}
              className="color-input"
            />
         </div>

        <div className="form-group form-group-icon">
            <label htmlFor="icon">Icon</label>
            <div className="icon-select-wrapper">
              <select
                  id="icon"
                  name="icon" // Input 'name' attribute
                  value={formData.icon} // <-- Access value from formData state
                  onChange={handleInputChange} // <-- Use generic handler
                  disabled={loading}
                  className="icon-select"
              >
                  {commonIcons.map(ic => <option key={ic} value={ic}>{ic}</option>)}
              </select>
              <span className="icon-preview" style={{backgroundColor: formData.color}}>{formData.icon}</span> {/* Use formData here too */}
            </div>
        </div>
      </div> {/* End form-row */}

      <div className="form-group">
        <label htmlFor="frequencyType">Frequency</label>
        <select name="frequencyType" id="frequencyType" value={formData.frequencyType} onChange={handleFrequencyTypeChange} disabled={loading}>
            <option value="daily">Daily</option>
            <option value="specific_days">Specific Days of Week</option>
            <option value="times_per_week">X Times per Week</option>
            <option value="every_n_days">Every N Days</option>
        </select>
      </div>

      {/* --- Conditional Frequency Details --- */}
      {formData.frequencyType === 'specific_days' && (
          <div className="form-group frequency-details">
              <label>Select Days:</label>
              <div className="days-checkbox-group">
                  {daysOfWeek.map((day, index) => (
                      <label key={index} className="day-checkbox-label">
                          <input
                              type="checkbox"
                              checked={formData.frequencyDays.includes(index)}
                              onChange={() => handleDaysChange(index)}
                              disabled={loading}
                          />
                          {day}
                      </label>
                  ))}
              </div>
          </div>
      )}

       {formData.frequencyType === 'times_per_week' && (
          <div className="form-group frequency-details">
              <label htmlFor="frequencyTarget">How many times per week?</label>
              <input
                  type="number"
                  id="frequencyTarget"
                  name="frequencyTarget"
                  min="1" max="7" step="1"
                  value={formData.frequencyTarget}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="frequency-input"
               />
          </div>
      )}

       {formData.frequencyType === 'every_n_days' && (
          <div className="form-group frequency-details">
               <label htmlFor="frequencyInterval">Every how many days?</label>
               <input
                  type="number"
                  id="frequencyInterval"
                  name="frequencyInterval"
                  min="1" step="1"
                  value={formData.frequencyInterval}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="frequency-input"
               />
               {/* Optional: Add Start Date Input Here */}
          </div>
      )}
      {/* --- End Conditional Frequency Details --- */}


      {/* Submit Button */}
      <button type="submit" className="submit-button" disabled={loading}>
        {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Habit' : 'Add Habit')}
      </button>
    </form>
  );
};

export default HabitForm;