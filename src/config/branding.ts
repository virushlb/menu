export const BRAND = {
  name: (import.meta.env.VITE_BRAND_NAME as string) || 'Beirut Vibes',
  tagline:
    (import.meta.env.VITE_BRAND_TAGLINE as string) ||
    'Mezze • Manakish • Charcoal Grill',
  currency: (import.meta.env.VITE_BRAND_CURRENCY as string) || 'USD',

  // Optional "story" section (editable from Admin → Settings)
  // Leave empty by default so the public menu stays clean/basic until the client adds content.
  aboutTitle: (import.meta.env.VITE_BRAND_ABOUT_TITLE as string) || 'Our Story',
  aboutText: (import.meta.env.VITE_BRAND_ABOUT_TEXT as string) || '',

  // Optional restaurant details (purely informational — no ordering on the website)
  address:
    (import.meta.env.VITE_BRAND_ADDRESS as string) ||
    'Hamra • Beirut, Lebanon',
  phone: (import.meta.env.VITE_BRAND_PHONE as string) || '+961 01 234 567',
  hours: (import.meta.env.VITE_BRAND_HOURS as string) || 'Daily • 11:00 – 23:00',
  mapsUrl:
    (import.meta.env.VITE_BRAND_MAPS_URL as string) ||
    'https://www.google.com/maps/search/?api=1&query=Hamra%2C%20Beirut',
  instagramUrl: (import.meta.env.VITE_BRAND_INSTAGRAM_URL as string) || '',
};

export const ADMIN = {
  enableSignup: String(import.meta.env.VITE_ENABLE_ADMIN_SIGNUP ?? 'true') === 'true',
};
