// backend/utils/percentageCalculator.js

/**
 * Utility function to calculate attendance percentage.
 * @param {number} present - Number of sessions attended.
 * @param {number} total - Total number of sessions held.
 * @returns {string} - Percentage formatted to two decimal places.
 */
const calculatePercentage = (present, total) => {
  if (!total || total === 0) return "0.00";
  
  const percentage = (present / total) * 100;
  return percentage.toFixed(2);
};

/**
 * Utility to determine if a student is below a certain attendance threshold.
 * Useful for generating "Shortage of Attendance" reports.
 * @param {number} present 
 * @param {number} total 
 * @param {number} threshold - Default is often 75.
 * @returns {boolean}
 */
const isBelowThreshold = (present, total, threshold = 75) => {
  const percentage = parseFloat(calculatePercentage(present, total));
  return percentage < threshold;
};

module.exports = {
  calculatePercentage,
  isBelowThreshold
};