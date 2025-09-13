// utils/cleanAddress.js
export const cleanAddress = (rawParts) => {
  // Words/phrases we want to strip out before geocoding
  const bannedWords = ["near", "opposite", "behind", "beside", "bus stop", "opp.", "nr."];

  return rawParts
    .filter(Boolean) // remove null/undefined
    .map((part) => {
      let cleaned = part.trim();

      // Remove banned words (case insensitive)
      bannedWords.forEach((word) => {
        const regex = new RegExp("\\b" + word + "\\b", "gi");
        cleaned = cleaned.replace(regex, "");
      });

      // Remove multiple spaces/commas
      cleaned = cleaned.replace(/\s{2,}/g, " ").replace(/,+/g, ",");
      return cleaned.trim();
    })
    .filter((p) => p.length > 0) // remove empty leftovers
    .join(", ");
};
