const DEFAULT_MAX_WIDTH = 1024;
const DEFAULT_MAX_HEIGHT = 1024;
const DEFAULT_MIME = 'image/jpeg';
const DEFAULT_QUALITY = 0.9;

const loadImage = (source) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = source;
  });

export const resizeImageFile = async (
  file,
  {
    maxWidth = DEFAULT_MAX_WIDTH,
    maxHeight = DEFAULT_MAX_HEIGHT,
    quality = DEFAULT_QUALITY,
  } = {}
) => {
  if (!file) {
    throw new Error('No file provided');
  }

  const mimeType = file.type?.startsWith('image/') ? file.type : DEFAULT_MIME;

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await loadImage(objectUrl);
    const ratio = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
    const targetWidth = Math.round(image.width * ratio);
    const targetHeight = Math.round(image.height * ratio);

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const context = canvas.getContext('2d', { alpha: true });

    context.drawImage(image, 0, 0, targetWidth, targetHeight);

    const dataUrl = canvas.toDataURL(mimeType, quality);
    return {
      dataUrl,
      width: targetWidth,
      height: targetHeight,
      mimeType,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};
