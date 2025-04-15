export const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return '';
  
  const date = new Date(dateTimeString);
  
  // Format date as YYYY-MM-DD
  const formattedDate = date.toLocaleDateString();
  
  // Format time as HH:MM AM/PM
  const formattedTime = date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true
  });
  
  return `${formattedDate} ${formattedTime}`;
};

// Optionally add more formatting functions
export const formatTimeOnly = (dateTimeString) => {
  if (!dateTimeString) return '';
  const date = new Date(dateTimeString);
  return date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
};

export const formatDateOnly = (dateTimeString) => {
  if (!dateTimeString) return '';
  return new Date(dateTimeString).toLocaleDateString();
};