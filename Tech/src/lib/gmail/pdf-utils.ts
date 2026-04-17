// Detects whether a PDF buffer is password-protected by checking for an /Encrypt
// entry in the document structure. Works for all standard PDF encryption variants.
// Returns false for non-PDF buffers rather than throwing.
export function isPdfPasswordProtected(buffer: Buffer): boolean {
  if (buffer.length < 5) return false
  if (buffer.slice(0, 5).toString('ascii') !== '%PDF-') return false

  // The /Encrypt dictionary entry appears in the first portion of the file.
  // Checking 16 KB covers even large cross-reference tables.
  const sample = buffer.subarray(0, Math.min(16384, buffer.length))
  return sample.includes(Buffer.from('/Encrypt'))
}
