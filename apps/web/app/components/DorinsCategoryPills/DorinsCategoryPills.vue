<template>
  <!-- Dorins: Kategorie-Leiste zum Wischen unter der Suche am Handy, wie im bisherigen Shop -->
  <!-- Hauptkategorien (oberste Ebene) stehen am Tablet schon als Reiter im Kopf, dort blendet der LTS die Leiste aus -->
  <nav
    v-if="pills.length"
    :class="['dorins-pills', { 'dorins-pills--root': currentPath.length <= 1 }]"
    data-testid="dorins-category-pills"
  >
    <NuxtLink
      v-if="parentLink"
      :to="localePath(parentLink)"
      class="dorins-pills-back"
      :aria-label="t('common.actions.back')"
    >
      <SfIconChevronLeft size="sm" />
    </NuxtLink>
    <NuxtLink
      v-for="pill in pills"
      :key="pill.id"
      :to="localePath(pill.link)"
      :class="['dorins-pill-nav', { 'dorins-pill-nav--active': pill.active }]"
    >
      {{ pill.name }}
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
import { SfIconChevronLeft } from '@storefront-ui/vue';
import { type CategoryTreeItem, categoryTreeGetters, productGetters } from '@plentymarkets/shop-api';

const { t } = useI18n();
const localePath = useLocalePath();
const { buildCategoryMenuLink } = useLocalization();
const { data: categoryTree } = useCategoryTree();
const { data: productsCatalog, currentProduct } = useProducts();

// Pfad von der Wurzel bis zur Kategorie (für Eltern und Geschwister)
const findPath = (nodes: CategoryTreeItem[], id: number, path: CategoryTreeItem[] = []): CategoryTreeItem[] => {
  for (const node of nodes) {
    if (node.id === id) return [...path, node];
    const found = findPath(node.children ?? [], id, [...path, node]);
    if (found.length) return found;
  }
  return [];
};

// Kategorieseite: aktuelle Kategorie; Artikelseite: die tiefste Kategorie des Artikels (z. B. „Bodies“)
const currentPath = computed(() => {
  const tree = categoryTree.value ?? [];
  if (isPageOfType('category') && productsCatalog.value.category?.id) {
    return findPath(tree, productsCatalog.value.category.id);
  }
  if (isPageOfType('product') && currentProduct.value && Object.keys(currentProduct.value).length) {
    return productGetters
      .getCategoryIds(currentProduct.value)
      .map((id) => findPath(tree, Number(id)))
      .reduce((deepest, path) => (path.length > deepest.length ? path : deepest), [] as CategoryTreeItem[]);
  }
  return [];
});

const route = useRoute();
const localeHome = computed(() => localePath('/'));

const pills = computed(() => {
  const path = currentPath.value;
  if (!path.length) {
    // Seiten ohne Artikelkategorie (Infoseiten, Konto, Warenkorb): Hauptkategorien wie im LTS, nicht auf der Startseite
    if (route.path === localeHome.value) return [];
    return (categoryTree.value ?? [])
      .filter((node) => categoryTreeGetters.getName(node))
      .map((node) => ({
        id: node.id,
        name: dorinsMenuLabel(node),
        link: buildCategoryMenuLink(node, categoryTree.value ?? []),
        active: false,
      }));
  }
  const current = path[path.length - 1]!;
  const siblings = path.length > 1 ? (path[path.length - 2]!.children ?? []) : (categoryTree.value ?? []);
  return (
    siblings
      .filter((node) => categoryTreeGetters.getName(node))
      .map((node) => ({
        id: node.id,
        name: dorinsMenuLabel(node),
        link: buildCategoryMenuLink(node, categoryTree.value ?? []),
        active: node.id === current.id,
      }))
      // aktuelle Kategorie zuerst, wie im LTS (dort per CSS-Reihenfolge, im Quelltext steht sie an ihrer Stelle)
      .sort((a, b) => Number(b.active) - Number(a.active))
  );
});

// Zurück-Pfeil nur auf Kategorieseiten (Artikelseite im LTS ohne)
const parentLink = computed(() => {
  if (!isPageOfType('category')) return '';
  const path = currentPath.value;
  return path.length > 1 ? buildCategoryMenuLink(path[path.length - 2]!, categoryTree.value ?? []) : '';
});
</script>
