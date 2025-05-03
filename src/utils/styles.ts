import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names into a single string.
 *
 * @param inputs - An array of class names or objects with class names.
 * @returns A string with combined class names.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Example of another utility function (optional)
/**
 * Formats a date string into a more readable format.
 *
 * @param dateString - The date string to format.
 * @returns A formatted date string or "Invalid Date" if the input is invalid.
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// You can add more utility functions here as needed
