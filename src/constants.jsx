// Gig categories
export const GIG_CATEGORIES = [
  'Graphics & Design',
  'Digital Marketing',
  'Writing & Translation',
  'Video & Animation',
  'Music & Audio',
  'Programming & Tech',
  'Data',
  'Business',
  'Lifestyle'
];

// Gig status
export const GIG_STATUS = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  DELETED: 'deleted'
};

// Order status
export const ORDER_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// User roles
export const USER_ROLES = {
  BUYER: 'buyer',
  SELLER: 'seller',
  ADMIN: 'admin'
};

// File upload limits
export const FILE_LIMITS = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  MAX_FILES: 5
};

// Payment methods
export const PAYMENT_METHODS = {
  CREDIT_CARD: 'credit_card',
  BANK_TRANSFER: 'bank_transfer',
  PAYPAL: 'paypal'
};

// Time intervals
export const TIME_INTERVALS = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year'
};

// Rating values
export const RATING_VALUES = {
  MIN: 1,
  MAX: 5
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 50
};

// Search filters
export const SEARCH_FILTERS = {
  PRICE_RANGE: {
    MIN: 0,
    MAX: 1000
  },
  RATING: {
    MIN: 1,
    MAX: 5
  },
  DELIVERY_TIME: {
    MIN: 1,
    MAX: 30
  }
};

// API endpoints
export const API_ENDPOINTS = {
  GIGS: '/api/gigs',
  ORDERS: '/api/orders',
  USERS: '/api/users',
  PAYMENTS: '/api/payments',
  UPLOADS: '/api/uploads'
};

// Error messages
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PASSWORD: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number',
  INVALID_FILE_TYPE: 'Invalid file type. Please upload an image file (JPEG, PNG, or GIF)',
  FILE_TOO_LARGE: 'File is too large. Maximum size is 5MB',
  TOO_MANY_FILES: 'Too many files. Maximum number of files is 5',
  NETWORK_ERROR: 'Network error. Please check your internet connection',
  SERVER_ERROR: 'Server error. Please try again later',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  NOT_FOUND: 'Resource not found'
};

// Success messages
export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: 'Profile updated successfully',
  GIG_CREATED: 'Gig created successfully',
  GIG_UPDATED: 'Gig updated successfully',
  GIG_DELETED: 'Gig deleted successfully',
  ORDER_CREATED: 'Order created successfully',
  ORDER_UPDATED: 'Order updated successfully',
  PAYMENT_SUCCESSFUL: 'Payment successful',
  UPLOAD_SUCCESSFUL: 'File uploaded successfully'
}; 