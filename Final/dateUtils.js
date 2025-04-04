// dateUtils.js
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);

    return date.toLocaleString("en-US", {
        weekday: "long", // e.g., "Monday"
        year: "numeric", // e.g., "2025"
        month: "long", // e.g., "April"
        day: "numeric", // e.g., "3"
        hour: "numeric", // e.g., "12"
        minute: "numeric", // e.g., "33"
        hour12: true, // Use 12-hour format (AM/PM)
    });
}

export { formatTimestamp };
