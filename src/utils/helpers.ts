/**
 * Utility functions for the M2M Payment Calculator
 */

/**
 * Format a date as YYYY-MM-DD
 * @param date Date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() is 0-based
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check if the device is running iOS
 * @returns True if the device is iOS
 */
export function isIos(): boolean {
  return /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
}

/**
 * Check if the web app is running in standalone mode
 * @returns True if the app is in standalone mode
 */
export function isInStandaloneMode(): boolean {
  return ('standalone' in window.navigator) && (window.navigator as any).standalone;
}

/**
 * Copy text to clipboard
 * @param text Text to copy
 * @returns Promise that resolves when copying is done
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    alert(`Copied: ${text}`);
  } catch (err) {
    console.error('Failed to copy: ', err);
    alert('Failed to copy text. Please copy manually.');
  }
}

/**
 * Create a ripple effect for a button
 * @param event Click event
 */
export function createRipple(event: MouseEvent): void {
  const button = event.currentTarget as HTMLElement;

  // Remove any existing ripples before adding a new one
  const ripples = button.getElementsByClassName("ripple");
  while (ripples.length > 0) {
    ripples[0].remove();
  }

  const circle = document.createElement("span");
  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter / 2;

  // Calculate click position relative to the element
  const rect = button.getBoundingClientRect();
  const x = event.clientX - rect.left - radius;
  const y = event.clientY - rect.top - radius;

  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${x}px`;
  circle.style.top = `${y}px`;
  circle.classList.add("ripple");

  button.appendChild(circle);

  // Remove the ripple after animation
  setTimeout(() => {
    circle.remove();
  }, 600);
}
