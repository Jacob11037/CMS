export const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return '';

  const date = new Date(dateTimeString);

  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    timeZone: 'UTC' // Keep UTC for consistent date formatting
  });

  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC' // Ensure UTC for consistent time formatting
  });

  return `${formattedDate} ${formattedTime}`;
};

export const formatTimeOnly = (dateTimeString) => {
  if (!dateTimeString) return '';

  const date = new Date(dateTimeString);

  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC' // Important: Format time in UTC
  });

  return formattedTime;
};

export const formatDateOnly = (dateTimeString) => {
  if (!dateTimeString) return '';
  return new Date(dateTimeString).toLocaleDateString(); // Uses the client's local timezone for date
};