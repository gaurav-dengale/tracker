// Helper to parse time strings like "7:30 AM", "12:00 PM", "9:45 PM" into minutes from midnight
function parseTimeToMinutes(timeStr, defaultMeridiem = 'AM') {
  if (!timeStr) return null;
  const cleaned = timeStr.trim().toUpperCase();
  const match = cleaned.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const meridiem = match[3] || defaultMeridiem;

  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

// Parses a slot string like "10:00 AM – 12:00 PM" or "7:30 – 9:30 AM" or "12:30 – 2:30 PM"
export function parseSlotRange(timeSlotStr) {
  if (!timeSlotStr) return null;
  const parts = timeSlotStr.split(/–|-|to/).map((p) => p.trim());
  if (parts.length < 2) return null;

  const endPart = parts[1];
  const endMeridiem = endPart.toUpperCase().includes('PM')
    ? 'PM'
    : endPart.toUpperCase().includes('AM')
    ? 'AM'
    : 'PM';

  const startMeridiem = parts[0].toUpperCase().includes('AM')
    ? 'AM'
    : parts[0].toUpperCase().includes('PM')
    ? 'PM'
    : endMeridiem;

  let startMinutes = parseTimeToMinutes(parts[0], startMeridiem);
  let endMinutes = parseTimeToMinutes(parts[1], endMeridiem);

  if (startMinutes === null || endMinutes === null) return null;
  // Handle midnight end of day rollover (e.g. 11:30 PM – 12:00 AM)
  if (endMinutes === 0 && startMinutes > 720) {
    endMinutes = 1440;
  }
  return { startMinutes, endMinutes };
}

// Determines if a schedule slot is active right now
export function isSlotActiveNow(timeSlotStr, now = new Date()) {
  const range = parseSlotRange(timeSlotStr);
  if (!range) return { isActive: false, minutesRemaining: 0 };

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const isActive = currentMinutes >= range.startMinutes && currentMinutes < range.endMinutes;
  const minutesRemaining = isActive ? range.endMinutes - currentMinutes : 0;

  return { isActive, minutesRemaining, startMinutes: range.startMinutes, endMinutes: range.endMinutes };
}

// Finds the currently active item from an array of schedule items
export function getActiveScheduleItem(items, now = new Date()) {
  if (!items || !items.length) return null;
  for (const item of items) {
    const { isActive, minutesRemaining } = isSlotActiveNow(item.timeSlot, now);
    if (isActive) {
      return { ...item, minutesRemaining };
    }
  }
  return null;
}
