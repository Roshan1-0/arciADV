/**
 * Trigger a file download in the browser.
 * @param {string} content - File content
 * @param {string} filename - Downloaded file name
 * @param {string} mimeType - MIME type (default: text/plain)
 */
export function downloadFile(content, filename, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Download all Terraform files as separate downloads.
 * @param {Object} files - { 'main.tf': '...', 'variables.tf': '...', 'outputs.tf': '...' }
 */
export function downloadTerraformFiles(files) {
  Object.entries(files).forEach(([filename, content]) => {
    setTimeout(() => downloadFile(content, filename, 'text/plain'), 200);
  });
}
