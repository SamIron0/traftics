export function sanitizeInputValue(element: HTMLInputElement): string {
  // Skip if element doesn't exist
  if (!element) return '';

  // Get input type
  const type = element.type.toLowerCase();

  // Handle different input types
  switch (type) {
    // Mask sensitive data
    case 'password':
      return '********';
    case 'email':
      return '[EMAIL]';
    case 'tel':
      return '[PHONE]';
    case 'number':
    case 'text':
    case 'search':
      // Check for sensitive data attributes
      if (
        element.name?.toLowerCase().includes('card') ||
        element.id?.toLowerCase().includes('card') ||
        element.name?.toLowerCase().includes('ssn') ||
        element.id?.toLowerCase().includes('ssn')
      ) {
        return '[SENSITIVE]';
      }
      // Return actual value for non-sensitive fields
      return element.value;
    case 'checkbox':
      return element.checked ? 'checked' : 'unchecked';
    case 'radio':
      return element.checked ? 'selected' : 'unselected';
    // Handle other input types
    default:
      return element.value;
  }
}
