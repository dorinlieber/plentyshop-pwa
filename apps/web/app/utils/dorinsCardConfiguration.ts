import type { ItemGridContent } from '~/components/blocks/ItemGrid/types';

/**
 * Dorins: Artikelkarten außerhalb der Kategorie-Vorlage (Empfehlungs-Slider, Suchergebnisse) wie in den Kategorien
 * und im bisherigen Shop: ohne Rahmen, Sterne, Knopf und Marke, mit Merkliste-Herz.
 */
export const dorinsCardConfiguration = {
  cardBorders: false,
  contentAlignment: 'left',
  fields: { title: true, rating: false, previewText: false, price: true, addToCart: false, manufacturer: false },
  fieldsOrder: ['title', 'manufacturer', 'rating', 'previewText', 'price', 'addToCart'],
  showWishlistButton: true,
  showSecondImageOnHover: false,
  addToCartStyle: 'primary',
} as unknown as ItemGridContent;
