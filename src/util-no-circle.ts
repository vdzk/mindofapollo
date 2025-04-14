// These functions are here to avoid circular dependencies that break the framework


// Function to enable SQL syntax highlighting that properly concatenates template strings and values
export const sqlStr = (strings: TemplateStringsArray, ...values: any[]) => {
  let result = strings[0];
  
  for (let i = 0; i < values.length; i++) {
    result += values[i] + strings[i + 1];
  }
  
  return result;
};
export const proportionPrecision = 6;
export const proportionDecimals = proportionPrecision - 1;
