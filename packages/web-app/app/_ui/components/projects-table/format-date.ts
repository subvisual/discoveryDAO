export const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
    timeZoneName: 'short',
  })
    .format(date)
    .split(',')
    .join(' -');
};
