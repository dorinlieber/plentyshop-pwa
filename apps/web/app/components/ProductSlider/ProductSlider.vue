<template>
  <div ref="sliderRootRef">
    <SfScrollable
      buttons-placement="floating"
      class="pb-4 scrollbar-hidden"
      :wrapper-class="wrapperClass"
      data-testid="product-slider"
    >
      <UiProductCard
        v-for="(product, index) in items"
        :key="productGetters.getId(product)"
        :product="product"
        :should-load-image="shouldLoadImage(index)"
        :index="index"
        is-from-slider
        :configuration="SLIDER_CARD_CONFIGURATION"
        class="w-48 max-w-48 shrink-0"
      />
    </SfScrollable>
  </div>
  <div class="mt-4 typography-text-xs flex gap-1">
    <span>{{ t('common.labels.asterisk') }}</span>
    <span v-if="showNetPrices">{{ t('product.priceExclVAT') }}</span>
    <span v-else>{{ t('product.priceInclVAT') }}</span>
    <i18n-t keypath="shipping.excludedLabel" scope="global">
      <template #shipping>
        <UiLink
          :href="localePath(paths.shipping)"
          target="_blank"
          class="focus:outline focus:outline-offset-2 focus:outline-2 outline-secondary-600 rounded"
        >
          {{ t('common.labels.delivery') }}
        </UiLink>
      </template>
    </i18n-t>
  </div>
</template>

<script setup lang="ts">
import { productGetters } from '@plentymarkets/shop-api';
import { SfScrollable } from '@storefront-ui/vue';
import type { ProductSliderProps } from '~/components/ProductSlider/types';
import type { ItemGridContent } from '~/components/blocks/ItemGrid/types';

// Dorins: Karten im Slider wie in den Kategorien (ohne Rahmen, Sterne, Knopf, Marke), wie im bisherigen Shop
const SLIDER_CARD_CONFIGURATION = {
  cardBorders: false,
  contentAlignment: 'left',
  fields: { title: true, rating: false, previewText: false, price: true, addToCart: false, manufacturer: false },
  fieldsOrder: ['title', 'manufacturer', 'rating', 'previewText', 'price', 'addToCart'],
  showWishlistButton: true,
  showSecondImageOnHover: false,
  addToCartStyle: 'primary',
} as unknown as ItemGridContent;
const { showNetPrices } = useCart();
const localePath = useLocalizedPath();

defineProps<ProductSliderProps>();

const { sliderRootRef, shouldLoadImage } = useSliderImagePreload({
  itemWidth: 192,
  itemGap: 16,
  preloadBuffer: 2,
});
</script>
