/**
 * Generates alternative slug suggestions if the provided base slug is already taken.
 * 
 * @param baseSlug - The original slug string that is taken
 * @param count - Number of suggestions to generate (default 3)
 * @returns Array of unique alternative slugs
 */
export function generateSlugSuggestions(baseSlug: string, count: number = 3): string[] {
  const suggestions: string[] = [];
  
  // Variation 1: Append a random 3-digit number (e.g., test-product-492)
  const randomNum = Math.floor(100 + Math.random() * 900);
  suggestions.push(`${baseSlug}-${randomNum}`);
  
  // Variation 2: Append 'shop' (e.g., test-product-shop)
  suggestions.push(`${baseSlug}-shop`);
  
  // Variation 3: Append the current year (e.g., test-product-2026)
  const year = new Date().getFullYear();
  suggestions.push(`${baseSlug}-${year}`);
  
  // Variation 4: Append a short hash (fallback if we need more)
  const randomHex = Math.floor(Math.random() * 16777215).toString(16).substring(0, 4);
  suggestions.push(`${baseSlug}-${randomHex}`);
  
  return suggestions.slice(0, count);
}
