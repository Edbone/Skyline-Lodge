const CLOUDINARY_CLOUD_NAME = 'dnjzeouq5';
const HERO_TAG = 'Main Lodge';
const GALLERY_TAG = 'Lodge';

const fallbackHeroPhotos = [
  {
    id: 'hero-exterior-sunset',
    src: 'https://res.cloudinary.com/demo/image/upload/w_1600,h_1100,c_fill,q_auto,f_auto/v1/sample.jpg',
    alt: 'Skyline Lodge exterior at sunset',
    title: 'Golden-hour arrival',
    caption: 'A warm welcome tucked into the Blue Ridge mountains.'
  },
  {
    id: 'hero-great-room',
    src: 'https://res.cloudinary.com/demo/image/upload/w_1600,h_1100,c_fill,q_auto,f_auto/v1/coffee.jpg',
    alt: 'Elegant living room with large windows',
    title: 'Light-filled interiors',
    caption: 'Gather beneath vaulted ceilings with views pouring in.'
  },
  {
    id: 'hero-deck-view',
    src: 'https://res.cloudinary.com/demo/image/upload/w_1600,h_1100,c_fill,q_auto,f_auto/v1/mountain.jpg',
    alt: 'Mountain view from the deck',
    title: 'Mountain mornings',
    caption: 'Start the day with crisp air and layered ridgeline views.'
  }
];

const fallbackGalleryPhotos = [
  ...fallbackHeroPhotos,
  {
    id: 'gallery-bedroom-retreat',
    src: 'https://res.cloudinary.com/demo/image/upload/w_1600,h_1100,c_fill,q_auto,f_auto/v1/aside.jpg',
    alt: 'Cozy bedroom at Skyline Lodge',
    title: 'Quiet retreat',
    caption: 'Soft textures and restful spaces designed to slow everything down.'
  },
  {
    id: 'gallery-fireside-lounge',
    src: 'https://res.cloudinary.com/demo/image/upload/w_1600,h_1100,c_fill,q_auto,f_auto/v1/cabin.jpg',
    alt: 'Fireplace and lounge area in the cabin',
    title: 'Fireside evenings',
    caption: 'Settle in after a day exploring Blue Ridge.'
  }
];

function humanizeSlug(value) {
  return value
    .split(/[\/_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function buildCloudinaryUrl(publicId, options = {}) {
  const transformations = [
    options.width ? `w_${options.width}` : null,
    options.height ? `h_${options.height}` : null,
    options.crop ?? 'c_fill',
    'q_auto',
    'f_auto'
  ]
    .filter(Boolean)
    .join(',');

  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformations}/${publicId}`;
}

function mapCloudinaryResource(resource, index, tag) {
  const leafName = resource.public_id.split('/').pop() ?? `photo-${index + 1}`;
  const readableName = humanizeSlug(leafName);

  return {
    id: resource.asset_id ?? resource.public_id,
    src: buildCloudinaryUrl(resource.public_id, { width: 1600, height: 1100 }),
    alt: `${readableName} at Skyline Lodge`,
    title: readableName,
    caption: `Cloudinary image tagged "${tag}" from your Skyline Lodge library.`
  };
}

async function fetchPhotosByTag(tag, fallbackPhotos) {
  try {
    const listUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/list/${encodeURIComponent(tag)}.json`;
    const response = await fetch(listUrl);

    if (!response.ok) {
      throw new Error(`Cloudinary list request failed with status ${response.status}`);
    }

    const payload = await response.json();
    const resources = Array.isArray(payload.resources) ? payload.resources : [];

    if (resources.length === 0) {
      return fallbackPhotos;
    }

    return resources.map((resource, index) => mapCloudinaryResource(resource, index, tag));
  } catch (error) {
    console.warn(`Falling back to local photos for tag "${tag}".`, error);
    return fallbackPhotos;
  }
}

export async function getHomePagePhotos() {
  const [heroPhotos, galleryPhotos] = await Promise.all([
    fetchPhotosByTag(HERO_TAG, fallbackHeroPhotos),
    fetchPhotosByTag(GALLERY_TAG, fallbackGalleryPhotos)
  ]);

  return { heroPhotos, galleryPhotos };
}

export { CLOUDINARY_CLOUD_NAME, HERO_TAG, GALLERY_TAG };

// Hero photos are loaded from the Cloudinary tag "Main Lodge".
// Gallery photos are loaded from the Cloudinary tag "Lodge".
// If your tagged images do not appear yet, enable Cloudinary's client-side resource list for images.
