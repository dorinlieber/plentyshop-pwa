import type { Product } from '@plentymarkets/shop-api';

export type WishlistButtonProps = {
  product: Product;
  quantity?: number;
  discard?: boolean;
  variant?: 'tertiary' | 'primary' | 'secondary' | undefined;
  /** Dorins: Herz aus dem bisherigen Shop (Umriss, gemerkt rot) statt der Storefront-Symbole */
  ltsHeart?: boolean;
};
