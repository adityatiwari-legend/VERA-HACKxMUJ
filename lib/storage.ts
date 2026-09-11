import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { AppError } from './permissions';

// Maximum upload size in MB (default 10 MB)
export const MAX_UPLOAD_SIZE_MB = parseInt(process.env.MAX_UPLOAD_SIZE_MB || '10', 10);
export const MAX_FILE_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024;

// Allowed MIME types and extensions mapping
export const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};

export interface StoredFileInfo {
  fileName: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  sha256Hash: string;
}

/**
 * Returns the configured base storage directory (defaults to <cwd>/storage)
 */
export function getStorageBasePath(): string {
  const customPath = process.env.STORAGE_PATH;
  if (customPath && customPath.trim().length > 0) {
    return path.resolve(customPath);
  }
  return path.resolve(process.cwd(), 'storage');
}

/**
 * Validates a file's MIME type and extension
 */
export function validateFileType(originalFilename: string, mimeType: string): string {
  const normalizedMime = (mimeType || '').toLowerCase().trim();
  const allowedExtensions = ALLOWED_MIME_TYPES[normalizedMime];

  if (!allowedExtensions) {
    throw new AppError(
      `Unsupported file type: "${mimeType}". Allowed types are PDF, JPG, PNG, and WEBP.`,
      400
    );
  }

  const ext = path.extname(originalFilename || '').toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    throw new AppError(
      `File extension "${ext}" does not match declared MIME type "${mimeType}".`,
      400
    );
  }

  return ext;
}

/**
 * Calculates SHA-256 fingerprint of a buffer
 */
export function calculateSha256(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Saves an uploaded file buffer securely to the disk
 * Path structure: storage/proofs/<proofId>/<uuid><safeExt>
 */
export async function saveProofFile(
  proofId: string,
  originalFilename: string,
  mimeType: string,
  buffer: Buffer
): Promise<StoredFileInfo> {
  // 1. Check size limit
  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    throw new AppError(
      `File "${originalFilename}" exceeds the maximum allowed size of ${MAX_UPLOAD_SIZE_MB}MB (${(buffer.length / (1024 * 1024)).toFixed(2)}MB).`,
      400
    );
  }

  if (buffer.length === 0) {
    throw new AppError(`Uploaded file "${originalFilename}" is empty.`, 400);
  }

  // 2. Validate file extension and MIME type
  const safeExt = validateFileType(originalFilename, mimeType);

  // 3. Compute SHA-256 hash
  const sha256Hash = calculateSha256(buffer);

  // 4. Generate safe server-side file name and secure destination path
  const sanitizedOriginal = path.basename(originalFilename).replace(/[^a-zA-Z0-9._-]/g, '_');
  const safeFileName = `${crypto.randomUUID()}_${sanitizedOriginal}`;
  
  const baseStorage = getStorageBasePath();
  // Safe directory creation
  const proofDir = path.join(baseStorage, 'proofs', proofId);
  fs.mkdirSync(proofDir, { recursive: true });

  const absoluteFilePath = path.join(proofDir, safeFileName);

  // Guard against path traversal
  if (!absoluteFilePath.startsWith(baseStorage)) {
    throw new AppError('Invalid file storage path target.', 400);
  }

  // 5. Write to disk
  fs.writeFileSync(absoluteFilePath, buffer);

  // Relative storage path stored in DB for portability (e.g. proofs/<proofId>/<safeFileName>)
  const relativeFilePath = path.join('proofs', proofId, safeFileName).replace(/\\/g, '/');

  return {
    fileName: sanitizedOriginal,
    filePath: relativeFilePath,
    mimeType: (mimeType || '').toLowerCase().trim(),
    fileSize: buffer.length,
    sha256Hash,
  };
}

/**
 * Resolves a stored relative path to an absolute path safely
 */
export function resolveSafeStoragePath(relativeFilePath: string): string {
  const baseStorage = getStorageBasePath();
  const absolutePath = path.resolve(baseStorage, relativeFilePath);

  if (!absolutePath.startsWith(baseStorage)) {
    throw new AppError('Illegal directory traversal path detected.', 403);
  }

  if (!fs.existsSync(absolutePath)) {
    throw new AppError('Requested file does not exist on disk.', 404);
  }

  return absolutePath;
}

/**
 * Clean up proof directory in case of database transaction failure
 */
export function cleanupProofDirectory(proofId: string): void {
  try {
    const baseStorage = getStorageBasePath();
    const proofDir = path.join(baseStorage, 'proofs', proofId);
    if (fs.existsSync(proofDir)) {
      fs.rmSync(proofDir, { recursive: true, force: true });
    }
  } catch (err) {
    console.error(`Failed to cleanup storage directory for proof ${proofId}:`, err);
  }
}
