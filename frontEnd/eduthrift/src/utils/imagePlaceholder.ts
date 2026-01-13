// Utility to generate placeholder images without external dependencies
export const generatePlaceholder = (color: string, text: string, width: number = 120, height: number = 150): string => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Fill background
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);

    // Add text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Word wrap for long text
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach(word => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);

      if (metrics.width > width - 20) {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });

    if (currentLine) lines.push(currentLine);

    // Draw text lines centered
    const lineHeight = 16;
    const startY = (height / 2) - ((lines.length - 1) * lineHeight / 2);

    lines.forEach((line, index) => {
      ctx.fillText(line, width / 2, startY + (index * lineHeight));
    });
  }

  return canvas.toDataURL('image/png');
};
