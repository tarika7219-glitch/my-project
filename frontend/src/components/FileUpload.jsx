import React, { useState } from 'react';
import '../styles/FileUpload.css';
import { FiUpload } from 'react-icons/fi';

function FileUpload({ onResumeSelect, onJobDescriptionSelect, onAnalyze, isLoading }) {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobFile, setJobFile] = useState(null);
  const [resumeName, setResumeName] = useState('');
  const [jobName, setJobName] = useState('');

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResumeFile(file);
      setResumeName(file.name);
      onResumeSelect(file);
    }
  };

  const handleJobChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setJobFile(file);
      setJobName(file.name);
      onJobDescriptionSelect(file);
    }
  };

  const handleAnalyze = () => {
    if (resumeFile && jobFile) {
      onAnalyze();
    }
  };

  return (
    <div className="file-upload-container">
      <div className="upload-section">
        <div className="upload-boxes">
          <div className="upload-box">
            <FiUpload className="upload-icon" />
            <h3>Upload Resume</h3>
            <label htmlFor="resume-input" className="file-label">
              <input
                id="resume-input"
                type="file"
                accept=".pdf,.txt"
                onChange={handleResumeChange}
                className="file-input"
              />
              Click to upload or drag & drop
            </label>
            {resumeName && <p className="file-name">✓ {resumeName}</p>}
            <p className="file-info">Supported: PDF, TXT (Max 16MB)</p>
          </div>

          <div className="upload-box">
            <FiUpload className="upload-icon" />
            <h3>Upload Job Description</h3>
            <label htmlFor="job-input" className="file-label">
              <input
                id="job-input"
                type="file"
                accept=".pdf,.txt"
                onChange={handleJobChange}
                className="file-input"
              />
              Click to upload or drag & drop
            </label>
            {jobName && <p className="file-name">✓ {jobName}</p>}
            <p className="file-info">Supported: PDF, TXT (Max 16MB)</p>
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={!resumeFile || !jobFile || isLoading}
          className={`analyze-button ${isLoading ? 'loading' : ''}`}
        >
          {isLoading ? 'Analyzing...' : 'Analyze Skills Match'}
        </button>
      </div>
    </div>
  );
}

export default FileUpload;
