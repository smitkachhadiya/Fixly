import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    serviceTitle: '',
    servicePrice: '',
    serviceDetails: '',
    tags: '',
    isActive: true
  });
  const [error, setError] = useState('');

 

  return (
    <div className="edit-listing">
      <h2>Edit Service Listing</h2>
      {error && <p className="error">{error}</p>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Service Title</label>
          <input
            type="text"
            value={formData.serviceTitle}
            onChange={(e) => setFormData({...formData, serviceTitle: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>Price</label>
          <input
            type="number"
            value={formData.servicePrice}
            onChange={(e) => setFormData({...formData, servicePrice: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>Service Details</label>
          <textarea
            value={formData.serviceDetails}
            onChange={(e) => setFormData({...formData, serviceDetails: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>Tags (comma-separated)</label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({...formData, tags: e.target.value})}
          />
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
            />
            Active Listing
          </label>
        </div>

        <button type="submit">Update Listing</button>
        <button type="button" onClick={() => navigate('/provider/dashboard')}>Cancel</button>
      </form>
    </div>
  );
}

export default EditListing;