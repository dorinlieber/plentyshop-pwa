<template>
  <div ref="sliderRootRef" class="relative">
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
        :should-load-image="isGrid || pageCount > 0 || shouldLoadImage(index)"
        :index="index"
        is-from-slider
        :configuration="dorinsCardConfiguration"
        class="w-48 max-w-48 shrink-0"
        :class="{ 'dorins-slider-more': !showAll && index >= 6 }"
      />
    </SfScrollable>
    <button v-if="!showAll && itemCount > 6" type="button" class="dorins-show-more" @click="showAll = true">
      {{ t('dorins.showMoreProducts') }}
    </button>
    <template v-if="isMounted && pageCount > 1">
      <button
        type="button"
        class="dorins-slider-arrow dorins-slider-arrow--prev"
        :aria-label="t('dorins.sliderPrev')"
        @click="goToPage(activePage - 1)"
      />
      <button
        type="button"
        class="dorins-slider-arrow dorins-slider-arrow--next"
        :aria-label="t('dorins.sliderNext')"
        @click="goToPage(activePage + 1)"
      />
      <ul class="dorins-slider-dots">
        <li v-for="page in pageCount" :key="page" :class="{ 'dorins-slider-dots--active': page - 1 === activePage }">
          <button
            type="button"
            :aria-label="t('dorins.sliderPage', { page })"
            :aria-current="page - 1 === activePage ? 'true' : undefined"
            @click="goToPage(page - 1)"
          />
        </li>
      </ul>
    </template>
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

const props = defineProps<ProductSliderProps>();

// Dorins: unter 768 px Raster statt Slider wie im LTS (CSS in dorins.css), dort alle Bilder laden (lazy)
const isGrid = useMediaQuery('(max-width: 767px)');
// wie im LTS: im Raster erst 6 Artikel, der Rest hinter „Weitere Artikel laden“
const showAll = ref(false);

const { sliderRootRef, shouldLoadImage } = useSliderImagePreload({
  itemWidth: 192,
  itemGap: 16,
  preloadBuffer: 2,
});

// Dorins: ab 768 px Seiten wie der LTS-Slider (slick): 3 Karten je Ansicht, ab 1120 px 4, Pfeile und Punkte,
// am Ende geht es ohne Rücklauf wieder vorn los (CSS in dorins.css)
const itemCount = computed(() => props.items?.length ?? 0);
const isFourPerView = useMediaQuery('(min-width: 1120px)');
const perView = computed(() => (isFourPerView.value ? 4 : 3));
const pageCount = computed(() => (isGrid.value ? 0 : Math.ceil(itemCount.value / perView.value)));
const activePage = ref(0);
// Ziel des laufenden Blätterns: Scroll-Ereignisse während der Animation ändern den aktiven Punkt nicht
let targetPage: number | null = null;
// Punkte erst nach dem Mount, vorher kennt useMediaQuery die Breite nicht
const isMounted = ref(false);

const scrollContainer = () => sliderRootRef.value?.querySelector<HTMLElement>('[data-testid="product-slider"]') ?? null;

const goToPage = (page: number) => {
  const el = scrollContainer();
  if (!el || pageCount.value < 1) return;
  const target = (page + pageCount.value) % pageCount.value;
  const wraps = target !== page;
  activePage.value = target;
  // steht die Liste schon dort, kommt kein Scroll-Ereignis, das die Sperre wieder löst
  targetPage = Math.abs(el.scrollLeft - target * el.clientWidth) < 2 ? null : target;
  el.scrollTo({ left: target * el.clientWidth, behavior: wraps ? 'instant' : 'smooth' });
};

const updateActivePage = () => {
  const el = scrollContainer();
  if (!el || pageCount.value < 1) return;
  const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2;
  const page = atEnd ? pageCount.value - 1 : Math.round(el.scrollLeft / el.clientWidth);
  if (targetPage !== null) {
    if (page !== targetPage) return;
    targetPage = null;
  }
  activePage.value = page;
};

onMounted(() => {
  isMounted.value = true;
  scrollContainer()?.addEventListener('scroll', updateActivePage, { passive: true });
});
onBeforeUnmount(() => scrollContainer()?.removeEventListener('scroll', updateActivePage));
// andere Kartenzahl je Ansicht (Fenster gedreht/vergrößert): auf die Seite mit dem bisher ersten Artikel wie slick
watch(perView, (now, before) => nextTick(() => goToPage(Math.floor((activePage.value * before) / now))));
</script>
