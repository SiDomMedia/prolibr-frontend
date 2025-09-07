// Utility functions for ProLibr AI frontend
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Tailwind CSS class merging utility
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Date formatting utilities
export function formatDate(date, options = {}) {
  if (!date) return '';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };
  
  return new Date(date).toLocaleDateString('en-US', defaultOptions);
}

export function formatDateTime(date, options = {}) {
  if (!date) return '';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options
  };
  
  return new Date(date).toLocaleDateString('en-US', defaultOptions);
}

export function formatRelativeTime(date) {
  if (!date) return '';
  
  const now = new Date();
  const target = new Date(date);
  const diffInSeconds = Math.floor((now - target) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks === 1 ? '' : 's'} ago`;
  }
  
  return formatDate(date);
}

// Text utilities
export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

export function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Validation utilities
export function validatePromptTitle(title) {
  if (!title || title.trim().length === 0) {
    return 'Title is required';
  }
  if (title.length > 255) {
    return 'Title must be less than 255 characters';
  }
  return null;
}

export function validatePromptContent(content) {
  if (!content || content.trim().length === 0) {
    return 'Content is required';
  }
  if (content.length > 10000) {
    return 'Content must be less than 10,000 characters';
  }
  return null;
}

export function validateTags(tags) {
  if (!Array.isArray(tags)) {
    return 'Tags must be an array';
  }
  if (tags.length > 10) {
    return 'Maximum 10 tags allowed';
  }
  for (const tag of tags) {
    if (typeof tag !== 'string' || tag.length > 50) {
      return 'Each tag must be a string with maximum 50 characters';
    }
  }
  return null;
}

// File utilities
export function downloadFile(content, filename, contentType = 'text/plain') {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Debounce utility
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Color utilities for categories
export function getCategoryColor(color, opacity = 1) {
  if (!color) return `rgba(0, 255, 255, ${opacity})`;
  
  // Convert hex to rgba
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// Error handling utilities
export function getErrorMessage(error) {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.error) return error.error;
  return 'An unexpected error occurred';
}

// Number utilities
export function formatNumber(num, options = {}) {
  if (typeof num !== 'number') return '0';
  
  const defaultOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options
  };
  
  return num.toLocaleString('en-US', defaultOptions);
}

