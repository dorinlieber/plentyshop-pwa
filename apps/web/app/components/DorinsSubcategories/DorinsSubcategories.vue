<template>
  <!-- Dorins: Unterkategorien als Bildkacheln unter dem Kategorietitel, wie im bisherigen Shop (z. B. /marken) -->
  <nav
    v-if="tiles.length"
    :class="['dorins-subcategories', { 'dorins-subcategories--gross': large }]"
    data-testid="dorins-subcategories"
  >
    <NuxtLink v-for="tile in tiles" :key="tile.id" :to="tile.link" class="dorins-subcategory">
      <span class="dorins-subcategory-image">
        <NuxtImg v-if="tile.image" :src="tile.image" :alt="tile.name" loading="lazy" />
      </span>
      <span class="dorins-subcategory-name">{{ tile.name }}</span>
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
import { type CategoryTreeItem, categoryTreeGetters } from '@plentymarkets/shop-api';

const runtimeConfig = useRuntimeConfig();
const route = useRoute();
const { data: productsCatalog } = useProducts();
const { data: categoryTree } = useCategoryTree();

// Hauptkategorien mit großen Fotokacheln (eine groß, zwei klein, abwechselnd), sonst kleine Kacheln mit Namen
const LARGE_LAYOUT = new Set(['jungenmode', 'maedchenmode']);

const findNode = (nodes: CategoryTreeItem[] | undefined, id: number): CategoryTreeItem | undefined => {
  for (const node of nodes ?? []) {
    if (node.id === id) return node;
    const found = findNode(node.children, id);
    if (found) return found;
  }
  return undefined;
};

const large = computed(() => {
  const id = productsCatalog.value.category?.id;
  const node = id ? findNode(categoryTree.value, id) : undefined;
  return LARGE_LAYOUT.has(node ? categoryTreeGetters.getSlug(node) : '');
});

const tiles = computed(() => {
  const id = productsCatalog.value.category?.id;
  if (!id) return [];
  const node = findNode(categoryTree.value, id);
  const basePath = route.path.replace(/\/$/, '');
  return (node?.children ?? [])
    .filter((child) => categoryTreeGetters.getName(child))
    .map((child) => {
      const details = child.details?.[0];
      const imagePath = (large.value && details?.image2Path) || details?.imagePath;
      return {
        id: child.id,
        name: categoryTreeGetters.getName(child),
        link: `${basePath}/${categoryTreeGetters.getSlug(child)}`,
        image: imagePath ? `${runtimeConfig.public.domain}/documents/${imagePath}` : '',
      };
    });
});
</script>
