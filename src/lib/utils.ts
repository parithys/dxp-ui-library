import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Joins class names and resolves conflicting Tailwind utilities (the last one wins): the helper the shadcn/ui components use. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
