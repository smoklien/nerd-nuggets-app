import DOMPurify from 'dompurify';

/**
 * Sanitizes and returns safe HTML for rendering.
 * @param {string} html - The HTML string to sanitize.
 * @returns {string} - A sanitized HTML string.
 */
export function sanitizeHtml(html) {
    return DOMPurify.sanitize(html);
}
