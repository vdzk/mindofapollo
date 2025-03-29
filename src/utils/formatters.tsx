import { JSX } from "solid-js";

export function parseBoldTags(text: string): (string | JSX.Element)[] {
  if (!text) return [];
  
  // Split the string by <b> and </b> tags
  const parts = text.split(/(<b>|<\/b>)/);
  const result: (string | JSX.Element)[] = [];
  
  let isBold = false;
  let currentText = '';
  
  parts.forEach(part => {
    if (part === '<b>') {
      if (currentText) {
        result.push(currentText);
        currentText = '';
      }
      isBold = true;
    } else if (part === '</b>') {
      if (currentText) {
        result.push(<b>{currentText}</b>);
        currentText = '';
      }
      isBold = false;
    } else {
      currentText += part;
      if (!isBold) {
        result.push(currentText);
        currentText = '';
      }
    }
  });
  
  // Add any remaining text
  if (currentText) {
    if (isBold) {
      result.push(<b>{currentText}</b>);
    } else {
      result.push(currentText);
    }
  }
  
  return result;
}
