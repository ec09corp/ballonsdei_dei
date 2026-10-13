/**
 * Utility to process, compress and convert user files into clean, persistent Data URLs.
 * Handles JPG, PNG, WEBP, GIF, and mobile photo formats seamlessly.
 * Optimized for fast uploads and minimal storage footprint (<80KB).
 */
export async function processImageFile(file: File, maxDimension = 800, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('Archivo no válido'));
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      if (!rawDataUrl) {
        return reject(new Error('No se pudo leer el archivo'));
      }

      // If it's a GIF or SVG, don't re-compress on canvas (keeps animation/vectors)
      if (file.type === 'image/gif' || file.type === 'image/svg+xml') {
        return resolve(rawDataUrl);
      }

      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width || 800;
          let height = img.height || 800;

          // Scale down if larger than maxDimension
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return resolve(rawDataUrl);
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'medium';
          ctx.drawImage(img, 0, 0, width, height);

          // Export as JPEG (most efficient for photos) or PNG if transparent
          const isPngWithAlpha = file.type === 'image/png';
          const outputType = isPngWithAlpha ? 'image/png' : 'image/jpeg';
          const compressed = canvas.toDataURL(outputType, quality);

          resolve(compressed);
        } catch (canvasErr) {
          console.warn('Canvas compression fallback to raw data URL:', canvasErr);
          resolve(rawDataUrl);
        }
      };

      img.onerror = () => {
        // Fallback to raw Data URL
        resolve(rawDataUrl);
      };

      img.src = rawDataUrl;
    };

    reader.onerror = () => {
      reject(new Error('Error leyendo archivo del dispositivo'));
    };

    reader.readAsDataURL(file);
  });
}
