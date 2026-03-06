import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

const getAuthConfig = (token) => {
  const authToken = token || localStorage.getItem('auth_token');
  return {
    headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
  };
};

export const analyzeResume = async (resumeFile, jobDescriptionFile) => {
  const formData = new FormData();
  formData.append('resume', resumeFile);
  formData.append('job_description', jobDescriptionFile);

  try {
    const response = await axios.post(`${API_BASE_URL}/analyze`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'An error occurred' };
  }
};

export const sendChatMessage = async (message, context = '') => {
  try {
    const response = await axios.post(`${API_BASE_URL}/chat`, {
      message,
      context,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'An error occurred' };
  }
};

export const getFileTypeHelp = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/file-type-help`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'An error occurred' };
  }
};

export const saveAnalysisSession = async (payload, token = null) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/analysis/save`,
      payload,
      getAuthConfig(token)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to save analysis' };
  }
};

export const getAnalysisHistory = async (limit = 20, token = null) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/analysis/history?limit=${limit}`,
      getAuthConfig(token)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch analysis history' };
  }
};

export const deleteAnalysisSession = async (sessionId, token = null) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/analysis/history/${sessionId}`,
      getAuthConfig(token)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to delete analysis' };
  }
};

export const getJobApplications = async (token = null) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/applications`,
      getAuthConfig(token)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch applications' };
  }
};

export const createJobApplication = async (payload, token = null) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/applications`,
      payload,
      getAuthConfig(token)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to create application' };
  }
};

export const updateJobApplication = async (id, payload, token = null) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/applications/${id}`,
      payload,
      getAuthConfig(token)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to update application' };
  }
};

export const deleteJobApplication = async (id, token = null) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/applications/${id}`,
      getAuthConfig(token)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to delete application' };
  }
};

export const rewriteResumeBullets = async (bullets, jobDescription = '') => {
  try {
    const response = await axios.post(`${API_BASE_URL}/rewrite-resume-bullets`, {
      bullets,
      job_description: jobDescription,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to rewrite resume bullets' };
  }
};

