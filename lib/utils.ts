/**
 * File upload utilities for document submission
 */

/**
 * Sanitizes a string for use in file names
 * - Removes extra spaces
 * - Replaces spaces with underscores
 * - Removes special characters that are problematic for file uploads
 * - Preserves Thai characters
 */
export function sanitizeFileName(name: string): string {
  return name
    .trim()
    // Replace multiple spaces with single space
    .replace(/\s+/g, " ")
    // Replace spaces with underscores
    .replace(/ /g, "_")
    // Remove problematic special characters (but keep Thai, numbers, letters, underscore, hyphen, dot)
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
    // Remove control characters
    .replace(/[\x00-\x1F\x7F]/g, "");
}

/**
 * Generates a standardized upload file name
 *
 * Format: {username}_{awardName}_{requirementLabel}[.{extension}]
 * - First file: username_award_name_requirementLabel.ext
 * - Second file: username_award_name_requirementLabel_2.ext
 * - Third file: username_award_name_requirementLabel_3.ext
 *
 * @param username - User's username (e.g., "b6610450960")
 * @param awardName - Name of the award (e.g., "ทุนกิจกรรมเด่น ประจำปี 2569")
 * @param requirementLabel - Label of the requirement (e.g., "ภาพถ่าย")
 * @param extension - File extension without dot (e.g., "png")
 * @param existingFilesCount - Number of existing files for this requirement (0 for first file)
 * @returns Sanitized file name with the generated format
 */
export function generateUploadFileName(
  username: string,
  awardName: string,
  requirementLabel: string,
  extension: string,
  existingFilesCount: number = 0,
): string {
  const sanitizedUsername = sanitizeFileName(username);
  const sanitizedAwardName = sanitizeFileName(awardName);
  const sanitizedRequirementLabel = sanitizeFileName(requirementLabel);
  const sanitizedExtension = extension.toLowerCase().replace(/^\./, "");

  const baseName = `${sanitizedUsername}_${sanitizedAwardName}_${sanitizedRequirementLabel}`;

  // First file has no suffix, subsequent files have _2, _3, etc.
  const suffix = existingFilesCount > 0 ? `_${existingFilesCount + 1}` : "";

  return `${baseName}${suffix}.${sanitizedExtension}`;
}

/**
 * Creates a new File object with a renamed file name
 *
 * @param file - Original file object
 * @param newName - New file name
 * @returns New File object with the specified name
 */
export function renameFile(file: File, newName: string): File {
  return new File([file], newName, { type: file.type });
}

/**
 * Extracts file extension from a file name
 *
 * @param fileName - File name (e.g., "document.pdf" or "image.PNG")
 * @returns File extension without dot (e.g., "pdf", "png")
 */
export function getFileExtension(fileName: string): string {
  const lastDotIndex = fileName.lastIndexOf(".");
  if (lastDotIndex === -1) {
    return "";
  }
  return fileName.slice(lastDotIndex + 1);
}
