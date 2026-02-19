import { BRAND } from '@/config/branding';
import { useRestaurantSettings } from '@/hooks/useRestaurantSettings';

/**
 * Merges env branding defaults with the DB-driven restaurant settings.
 * This lets the menu feel "client-ready" while still working even before settings are filled.
 */
export function useRestaurantBrand() {
  const settingsQuery = useRestaurantSettings();
  const s = settingsQuery.data;

  const brand = {
    ...BRAND,
    name: s?.name || BRAND.name,
    tagline: s?.tagline || BRAND.tagline,
    currency: s?.currency || BRAND.currency,
    address: s?.address || BRAND.address,
    phone: s?.phone || BRAND.phone,
    hours: s?.hours || BRAND.hours,
    mapsUrl: s?.maps_url || BRAND.mapsUrl,
    instagramUrl: s?.instagram_url || BRAND.instagramUrl,

    aboutTitle: s?.about_title || BRAND.aboutTitle,
    aboutText: s?.about_text || BRAND.aboutText,
    aboutImageUrl: s?.about_image_url || null,
  };

  return { brand, settingsQuery };
}
