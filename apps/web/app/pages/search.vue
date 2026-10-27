<template>
  <NuxtLayout name="default">
    <div data-testid="search-results" class="relative" :class="{ 'pointer-events-none opacity-50': loading }">
      <SfLoaderCircular v-if="loading" class="fixed top-[50%] right-0 left-0 m-auto z-max" size="2xl" />
      <div
        v-if="searchInfo && (searchInfo.corrected || searchInfo.sizes.length)"
        class="px-4 @md:px-0 mt-4 text-sm"
        data-testid="search-info"
      >
        <p v-if="searchInfo.corrected">
          {{ t('search.correctedTerm', { original: searchInfo.originalTerm, term: searchInfo.term }) }}
        </p>
        <p v-if="searchInfo.sizes.length">
          {{ t('search.sizeFilter', { sizes: searchInfo.sizes.join(', ') }) }}
          <NuxtLink :to="{ query: { ...route.query, allSizes: '1', facets: undefined } }" class="underline">
            {{ t('search.allSizes') }}
          </NuxtLink>
        </p>
      </div>
      <!-- Dorins: Suchergebnisse im Aufbau des bisherigen Shops (Titel „1097 Artikel gefunden“, Filterleiste oben) -->
      <CategoryPageContent
        v-if="productsCatalog"
        class="dorins-search-filters"
        :title="t('dorins.searchFound', productsCatalog.pagination.totals)"
        :total-products="productsCatalog.pagination.totals"
        :products="productsCatalog.products"
        :items-per-page="Number(productsPerPage)"
      >
        <template #listControls>
          <CategorySorting class="dorins-mobile-sort" />
          <CategoryItemsPerPage class="dorins-tablet-perpage" :total-products="productsCatalog.pagination.totals" />
        </template>
        <template #sidebar>
          <CategorySorting />
          <CategoryItemsPerPage class="mt-6" :total-products="productsCatalog.pagination.totals" />
          <CategoryFilters v-if="facetGetters.hasFilters(productsCatalog.facets)" :facets="productsCatalog.facets" />
        </template>
      </CategoryPageContent>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { facetGetters } from '@plentymarkets/shop-api';
import { SfLoaderCircular } from '@storefront-ui/vue';
import type { Locale } from '#i18n';
import type { DorinsSearchResult } from '~/composables/useSearch/types';

defineI18nRoute({
  locales: process.env.LANGUAGELIST?.split(',') as Locale[],
});

const { getRobots, setRobotForStaticPage } = useRobots();
const { setItemListMetaData } = useStructuredData();

definePageMeta({
  layout: false,
  type: 'search',
});

const route = useRoute();

// Dorins: alte Shop-Suche hieß /search?query=…; ohne Suchbegriff fiel die Seite mit Fehler 500 aus
if (!route.query.term) {
  const { query: oldTerm, ...rest } = route.query;
  await navigateTo(oldTerm ? { path: route.path, query: { ...rest, term: oldTerm } } : useLocalizedPath()(paths.home), {
    redirectCode: 301,
  });
}

const { getSearch, data: productsCatalog, productsPerPage, loading } = useSearch();
const { getFacetsFromURL } = useCategoryFilter();

const searchInfo = computed(() => (productsCatalog.value as DorinsSearchResult | undefined)?.searchInfo);

// Eigener Seitentitel wie im bisherigen Shop („Suchergebnisse für …“); robots kommt aus den Editor-Einstellungen
const { t } = useI18n();
useHead(() => ({ title: t('search.searchResults', { phrase: route.query.term }) }));

const handleQueryUpdate = async () => {
  const params = { ...getFacetsFromURL(), autoSize: route.query.allSizes !== '1' };
  await getSearch(params);
  setItemListMetaData(productsCatalog.value?.products || []);
};

await handleQueryUpdate();

watch(
  () => route.query,
  async () => {
    handleQueryUpdate();
  },
);

await getRobots();
setRobotForStaticPage('SearchResult');
</script>
