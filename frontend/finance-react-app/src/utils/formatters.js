// Handle API errors
export const handleApiError = (error, defaultMessage) => {
  const errorMessage = error.response?.data?.message || defaultMessage;
  const customError = new Error(errorMessage);
  customError.response = error.response;
  customError.status = error.response?.status;
  return customError;
};

// Format currency
export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === null || amount === undefined) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Format date
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Format date (short version)
export const formatDateShort = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

// Format account number (mask middle digits)
export const formatAccountNumber = (accountNumber) => {
  if (!accountNumber) return 'N/A';
  
  if (accountNumber.length <= 8) return accountNumber;
  
  const start = accountNumber.substring(0, 4);
  const end = accountNumber.substring(accountNumber.length - 4);
  const middle = '*'.repeat(accountNumber.length - 8);
  
  return `${start}${middle}${end}`;
};

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Get transaction type color
export const getTransactionTypeColor = (type) => {
  switch (type?.toUpperCase()) {
    case 'DEPOSIT':
      return '#28a745'; // Green
    case 'WITHDRAW':
      return '#dc3545'; // Red
    case 'TRANSFER':
      return '#007bff'; // Blue
    default:
      return '#6c757d'; // Gray
  }
};

// Get transaction status color
export const getTransactionStatusColor = (status) => {
  switch (status?.toUpperCase()) {
    case 'COMPLETED':
      return '#28a745'; // Green
    case 'PENDING':
      return '#ffc107'; // Yellow
    case 'FAILED':
      return '#dc3545'; // Red
    default:
      return '#6c757d'; // Gray
  }
};

// Get account status color
export const getAccountStatusColor = (status) => {
  switch (status?.toUpperCase()) {
    case 'ACTIVE':
      return '#28a745'; // Green
    case 'SUSPENDED':
      return '#dc3545'; // Red
    default:
      return '#6c757d'; // Gray
  }
};
