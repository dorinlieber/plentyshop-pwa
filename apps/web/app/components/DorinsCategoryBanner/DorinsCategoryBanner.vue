<template>
  <!-- Dorins: Kopfbanner über dem Kategorietitel, wie im bisherigen Shop (nur SALE, Jungenmode, Mädchenmode) -->
  <div v-if="banner" class="dorins-category-banner" data-testid="dorins-category-banner">
    <picture>
      <source media="(min-width: 1440px)" :srcset="`${banner.bild}_gross.jpg`" />
      <source media="(min-width: 720px)" :srcset="`${banner.bild}_mittel.jpg`" />
      <img :src="`${banner.bild}_klein.jpg`" :alt="banner.titel" />
    </picture>
    <span class="dorins-display dorins-category-banner-title">{{ banner.titel }}</span>
  </div>
</template>

<script setup lang="ts">
import { categoryGetters } from '@plentymarkets/shop-api';

const CDN = 'https://cdn03.plentymarkets.com/0g0quyrt02bw/frontend';
// Bilder und Titel aus dem LTS-Template (createyourtemplate), dort pro Kategorie hinterlegt
const BANNER: Record<string, { bild: string; titel: string }> = {
  sale: { bild: `${CDN}/_kategorie-einstiege/21_12_21/Sale`, titel: 'CODE: SALE26' },
  jungenmode: { bild: `${CDN}/_kategorie-banner/21_12_21/jungen`, titel: 'Jungenmode' },
  maedchenmode: { bild: `${CDN}/_kategorie-banner/21_12_21/maedchen`, titel: 'Mädchenmode' },
};

const { data: productsCatalog } = useProducts();
const banner = computed(() => {
  const category = productsCatalog.value.category;
  if (!category) return undefined;
  return BANNER[categoryGetters.getCategoryDetails(category)?.nameUrl ?? ''];
});
</script>
