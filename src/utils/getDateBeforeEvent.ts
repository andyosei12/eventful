const getDateBeforeEvent = (date: Date, daysBefore: number): Date => {
  const eventDate = new Date(date);

  const reminderDate = new Date(
    eventDate.setDate(eventDate.getDate() - daysBefore),
  );

  return reminderDate;
};

export default getDateBeforeEvent;
