export function getElementId(element: HTMLElement): string {
  if (!element.id) {
    element.id = `element-${Math.random().toString(36).substr(2, 9)}`;
  }
  return element.id;
}
