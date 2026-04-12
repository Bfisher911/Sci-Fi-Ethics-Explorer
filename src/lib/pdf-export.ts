/**
 * Export a DOM element's content as a downloadable text report.
 * Uses a simple Blob-based approach with no extra dependencies.
 */
export function exportToPdf(elementId: string, filename: string): void {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`[pdf-export] Element with id "${elementId}" not found`);
    return;
  }

  // Use window.print() with a print-specific approach
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    // Fallback: download as text file
    downloadAsText(element, filename);
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${filename}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 20px;
          color: #1a1a2e;
          line-height: 1.6;
        }
        h1, h2, h3 { color: #16213e; }
        .badge {
          display: inline-block;
          background: #e8f0fe;
          padding: 2px 10px;
          border-radius: 12px;
          margin: 2px 4px;
          font-size: 0.85em;
        }
        .stat { margin-bottom: 8px; }
        .section { margin-bottom: 24px; border-bottom: 1px solid #e0e0e0; padding-bottom: 16px; }
        @media print {
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      ${element.innerHTML}
    </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();

  // Give the browser a moment to render before printing
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
}

/**
 * Fallback: download element content as a plain text file.
 */
function downloadAsText(element: HTMLElement, filename: string): void {
  const text = element.innerText || element.textContent || '';
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
