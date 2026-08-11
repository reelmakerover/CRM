function generateQrSvg(text, size = 320) {
  const modulesCount = 29;
  const matrix = Array(modulesCount).fill(null).map(() => Array(modulesCount).fill(false));

  function addFinderPattern(x, y) {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 || r === 6 || c === 0 || c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          matrix[y + r][x + c] = true;
        } else {
          matrix[y + r][x + c] = false;
        }
      }
    }
  }

  addFinderPattern(0, 0);
  addFinderPattern(modulesCount - 7, 0);
  addFinderPattern(0, modulesCount - 7);

  for (let i = 8; i < modulesCount - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash |= 0;
  }

  let bitIdx = 0;
  for (let r = 0; r < modulesCount; r++) {
    for (let c = 0; c < modulesCount; c++) {
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= modulesCount - 8;
      const inBottomLeft = r >= modulesCount - 8 && c < 8;
      const isTiming = r === 6 || c === 6;

      if (!inTopLeft && !inTopRight && !inBottomLeft && !isTiming) {
        const bit = ((hash ^ (r * 31 + c * 17 + bitIdx * 13)) & 1) === 1;
        matrix[r][c] = bit;
        bitIdx++;
      }
    }
  }

  const quietZoneModules = 4;
  const totalModules = modulesCount + (quietZoneModules * 2);
  const cellSize = size / totalModules;
  let rects = '';

  for (let r = 0; r < modulesCount; r++) {
    for (let c = 0; c < modulesCount; c++) {
      if (matrix[r][c]) {
        const x = (c + quietZoneModules) * cellSize;
        const y = (r + quietZoneModules) * cellSize;
        rects += `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${cellSize.toFixed(2)}" height="${cellSize.toFixed(2)}" fill="#000000"/>`;
      }
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" shape-rendering="crispEdges">
    <rect width="100%" height="100%" fill="#ffffff"/>
    ${rects}
  </svg>`;

  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

module.exports = {
  generateQrSvg
};
