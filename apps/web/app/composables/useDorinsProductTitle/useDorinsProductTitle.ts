import { productGetters, productPropertyGetters } from '@plentymarkets/shop-api';
import type { Product } from '@plentymarkets/shop-api';

// Titel wie im bisherigen Shop = Eigenschaft „Limango-Titel“ (34) + „von <Marke>“, sonst Artikelname
const SHORT_TITLE_PROPERTY_ID = 34;

/**
 * @description Dorins: Anzeigetitel und Marke eines Artikels wie im bisherigen Shop (Kaufbox und Handy-Titel).
 */
export const useDorinsProductTitle = (product: MaybeRefOrGetter<Product>) => {
  const { t } = useI18n();

  const brandName = computed(() => {
    const manufacturer = productGetters.getManufacturer(toValue(product)) as
      | { externalName?: string; name?: string }
      | undefined;
    return manufacturer?.externalName || manufacturer?.name || '';
  });

  const displayName = computed(() => {
    const current = toValue(product);
    const shortTitle = productPropertyGetters.getProperty(
      SHORT_TITLE_PROPERTY_ID,
      productGetters.getPropertyGroups(current),
    )?.values as { value?: string } | undefined;
    const title = shortTitle?.value?.trim();
    if (!title) return productGetters.getName(current);
    return brandName.value ? t('dorins.titleWithBrand', { title, brand: brandName.value }) : title;
  });

  return { brandName, displayName };
};
