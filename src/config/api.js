// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const getApiUrl = (path) => {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // If API_BASE_URL is empty, use relative URL (for local development)
  if (!API_BASE_URL) {
    return `/${cleanPath}`;
  }
  
  // Use absolute URL for production
  return `${API_BASE_URL}/${cleanPath}`;
};
