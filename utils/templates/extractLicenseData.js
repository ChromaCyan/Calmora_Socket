const Tesseract = require("tesseract.js");

async function extractLicenseData(imageUrl) {
  try {
    const result = await Tesseract.recognize(imageUrl, "eng");
    const text = result.data.text;

    // Basic pattern matching
    const licenseNumber = text.match(/\b\d{4,}-\d{2,}\b/)?.[0] || null;
    const nameMatch = text.match(/Name[:\s]+([A-Z\s]+)/i);
    const profession = text.match(/PSYCHOLOGIST|PSYCHOMETRICIAN|PHYSICIAN|COUNSELOR|THERAPIST/i);
    const expiry = text.match(/Valid\s*until[:\s]*([A-Za-z0-9\s]+)/i);

    return {
      extractedName: nameMatch?.[1]?.trim() || null,
      extractedLicenseNumber: licenseNumber,
      extractedProfession: profession ? profession[0] : null,
      extractedExpiry: expiry ? expiry[1].trim() : null,
      confidenceScore: result.data.confidence,
    };
  } catch (err) {
    console.error("OCR extraction failed:", err);
    return null;
  }
}

module.exports = extractLicenseData;
