// utils/dateUtils.js
const getTodayDateString = () => {
    const today = new Date();
    // Use UTC date parts to avoid timezone shifts affecting the YYYY-MM-DD representation
    const year = today.getUTCFullYear();
    const month = String(today.getUTCMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(today.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getYesterdayDateString = () => {
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1); // Use UTC methods
    const year = yesterday.getUTCFullYear();
    const month = String(yesterday.getUTCMonth() + 1).padStart(2, '0');
    const day = String(yesterday.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Gets the YYYY-MM-DD string for any given Date object
const getDateString = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

module.exports = { getTodayDateString, getYesterdayDateString, getDateString };