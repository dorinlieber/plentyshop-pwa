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
        :should-load-image="isGrid || shouldLoadImage(index)"
        :index="index"
        is-from-slider
        :configuration="dorinsCardConfiguration"
        class="w-48 max-w-48 shrink-0"
        :class="{ 'dorins-slider-more': !showAll && index >= 6 }"
      />
    </SfScrollable>
    <button v-if="!showAll && (items?.length ?? 0) > 6" type="button" class="dorins-show-more" @click="showAll = true">
      {{ t('dorins.showMoreProducts') }}
    </button>
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
import { useMediaQuery } from '@vueuse/core';
import type { ProductSliderProps } from '~/components/ProductSlider/types';
const { showNetPrices } = useCart();
const localePath = useLocalizedPath();

defineProps<ProductSliderProps>();

// Dorins: unter 768 px Raster statt Slider wie im LTS (CSS in dorins.css), dort alle Bilder laden (lazy)
const isGrid = useMediaQuery('(max-width: 767px)');
// wie im LTS: im Raster erst 6 Artikel, der Rest hinter „Weitere Artikel laden“
const showAll = ref(false);

const { sliderRootRef, shouldLoadImage } = useSliderImagePreload({
  itemWidth: 192,
  itemGap: 16,
  preloadBuffer: 2,
});
</script>
