<template>
  <!-- Dorins: Tablet-Kopf (768-1199 px) wie im bisherigen Shop: Hauptkategorien als Reiter neben dem Logo -->
  <nav class="dorins-tablet-tabs" data-testid="dorins-tablet-tabs">
    <NuxtLink
      v-for="tab in tabs"
      :key="tab.id"
      :to="localePath(tab.link)"
      :class="['dorins-tablet-tab', { 'dorins-tablet-tab--sale': tab.sale, 'dorins-tablet-tab--active': tab.active }]"
    >
      {{ tab.name }}
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
import { categoryTreeGetters } from '@plentymarkets/shop-api';

const localePath = useLocalePath();
const route = useRoute();
const { buildCategoryMenuLink } = useLocalization();
const { data: categoryTree } = useCategoryTree();

const tabs = computed(() =>
  (categoryTree.value ?? [])
    .filter((node) => categoryTreeGetters.getName(node))
    .map((node) => {
      const link = buildCategoryMenuLink(node, categoryTree.value ?? []);
      const target = localePath(link);
      return {
        id: node.id,
        name: dorinsMenuLabel(node),
        link,
        sale: categoryTreeGetters.getSlug(node) === 'sale',
        active: route.path === target || route.path.startsWith(`${target}/`),
      };
    }),
);
</script>
