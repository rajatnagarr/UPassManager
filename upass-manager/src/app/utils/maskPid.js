/**
 * Masks the last 4 digits of a PID number
 * @param {string} pid - The PID to mask
 * @returns {string} - The masked PID
 */
export const maskPid = (pid) => {
  if (!pid) return '';
  
  // Convert to string in case it's a number
  const pidStr = String(pid);
  
  // If PID is less than 5 characters, mask all but the first character
  if (pidStr.length < 5) {
    return pidStr.charAt(0) + '*'.repeat(pidStr.length - 1);
  }
  
  // Otherwise, mask the last 4 digits
  return pidStr.slice(0, -4) + '****';
};
