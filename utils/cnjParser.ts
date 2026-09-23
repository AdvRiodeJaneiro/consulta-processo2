import { CNJParts } from '../types';

// Regex to capture the standard formatted CNJ anywhere in the text
// NNNNNNN-DD.AAAA.J.TR.OOOO
const CNJ_PATTERN = /(\d{7})-?(\d{2})\.?(\d{4})\.?(\d{1})\.?(\d{2})\.?(\d{4})/;

export const parseCNJ = (input: string): CNJParts | null => {
  // 1. Try to find a formatted CNJ pattern first
  const match = input.match(CNJ_PATTERN);

  if (match) {
    // match[0] is the full string, 1-6 are the groups
    return {
      number: match[1],
      digit: match[2],
      year: match[3],
      justice: match[4],
      tribunal: match[5],
      origin: match[6]
    };
  }

  // 2. Fallback: Check if the string is just a raw sequence of 20 digits (ignoring non-digits)
  const cleanCNJ = input.replace(/[^\d]/g, '');
  if (cleanCNJ.length === 20) {
    return {
      number: cleanCNJ.substring(0, 7),
      digit: cleanCNJ.substring(7, 9),
      year: cleanCNJ.substring(9, 13),
      justice: cleanCNJ.substring(13, 14),
      tribunal: cleanCNJ.substring(14, 16),
      origin: cleanCNJ.substring(16, 20)
    };
  }

  return null;
};

export const formatCNJ = (parts: CNJParts): string => {
  return `${parts.number}-${parts.digit}.${parts.year}.${parts.justice}.${parts.tribunal}.${parts.origin}`;
};