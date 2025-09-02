export const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // space → hyphen
    .replace(/[^\p{L}\p{N}-]+/gu, '') // letters (all languages) + numbers + hyphen
    .replace(/\-\-+/g, '-'); // multiple hyphens → single
};
