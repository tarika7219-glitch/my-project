import React, { useState, useEffect } from 'react';
import '../styles/UserProfile.css';
import { FiX, FiSave, FiEdit2, FiUser, FiMapPin, FiBook } from 'react-icons/fi';
import { API_BASE_URL } from '../api';

function UserProfile({ user, onClose, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    country: user?.country || '',
    learning_interests: user?.learning_interests || [],
    bio: user?.bio || '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [interestInput, setInterestInput] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        country: user.country || '',
        learning_interests: user.learning_interests || [],
        bio: user.bio || '',
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addInterest = () => {
    if (interestInput.trim()) {
      setFormData(prev => ({
        ...prev,
        learning_interests: [...prev.learning_interests, interestInput.trim()]
      }));
      setInterestInput('');
    }
  };

  const removeInterest = (index) => {
    setFormData(prev => ({
      ...prev,
      learning_interests: prev.learning_interests.filter((_, i) => i !== index)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addInterest();
    }
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setSuccess('Profile updated successfully!');
      
      // Update local storage
      localStorage.setItem('user_info', JSON.stringify(data.profile));
      
      // Call parent callback
      if (onUpdate) {
        onUpdate(data.profile);
      }

      setIsEditing(false);

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-overlay">
      <div className="profile-modal">
        <button className="profile-close" onClick={onClose}>
          <FiX />
        </button>

        <div className="profile-header">
          <div className="profile-avatar">
            {user?.google_picture ? (
              <img src={user.google_picture} alt="Profile" />
            ) : (
              <FiUser />
            )}
          </div>
          <div className="profile-title">
            <h2>{user?.username || 'User'}</h2>
            <p>{user?.email}</p>
          </div>
        </div>

        {error && <div className="profile-error">{error}</div>}
        {success && <div className="profile-success">{success}</div>}

        <div className="profile-content">
          {!isEditing ? (
            <>
              <div className="profile-section">
                <h3>Profile Information</h3>
                
                <div className="profile-item">
                  <label>Name</label>
                  <p>{formData.username || 'Not set'}</p>
                </div>

                <div className="profile-item">
                  <label><FiMapPin /> Country</label>
                  <p>{formData.country || 'Not set'}</p>
                </div>

                <div className="profile-item">
                  <label><FiBook /> Learning Interests</label>
                  <div className="interests-display">
                    {formData.learning_interests && formData.learning_interests.length > 0 ? (
                      formData.learning_interests.map((interest, index) => (
                        <span key={index} className="interest-tag">{interest}</span>
                      ))
                    ) : (
                      <p>No interests added yet</p>
                    )}
                  </div>
                </div>

                {formData.bio && (
                  <div className="profile-item">
                    <label>Bio</label>
                    <p>{formData.bio}</p>
                  </div>
                )}
              </div>

              <div className="profile-joined">
                <p>Member since {new Date(user?.created_at).toLocaleDateString()}</p>
              </div>

              <button className="profile-edit-btn" onClick={() => setIsEditing(true)}>
                <FiEdit2 /> Edit Profile
              </button>
            </>
          ) : (
            <>
              <div className="profile-form">
                <div className="form-group">
                  <label htmlFor="username">Name</label>
                  <input
                    id="username"
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Your name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="country"><FiMapPin /> Country</label>
                  <input
                    id="country"
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="e.g., India, USA, UK"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="interests"><FiBook /> Learning Interests</label>
                  <div className="interest-input-group">
                    <input
                      id="interests"
                      type="text"
                      value={interestInput}
                      onChange={(e) => setInterestInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="e.g., Python, Web Development, Data Science"
                    />
                    <button 
                      type="button" 
                      onClick={addInterest}
                      className="add-interest-btn"
                    >
                      Add
                    </button>
                  </div>
                  
                  <div className="interests-edit">
                    {formData.learning_interests && formData.learning_interests.length > 0 ? (
                      formData.learning_interests.map((interest, index) => (
                        <div key={index} className="interest-tag-edit">
                          <span>{interest}</span>
                          <button 
                            type="button"
                            onClick={() => removeInterest(index)}
                            className="remove-btn"
                          >
                            ×
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="no-interests">No interests added yet</p>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="bio">Bio (optional)</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself..."
                    rows="4"
                  />
                </div>
              </div>

              <div className="profile-actions">
                <button 
                  className="profile-cancel-btn" 
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  className="profile-save-btn" 
                  onClick={handleSave}
                  disabled={loading}
                >
                  <FiSave /> {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProfile;

