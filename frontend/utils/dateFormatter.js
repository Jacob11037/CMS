export const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return '';

  const date = new Date(dateTimeString);

  const formattedDate = date.toLocaleDateString('en-US', {
    timeZone: 'UTC'
  });

  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC'
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