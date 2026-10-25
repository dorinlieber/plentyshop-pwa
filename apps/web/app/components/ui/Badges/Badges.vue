<template>
  <div v-if="haveBadges" data-testid="badges" class="z-overlap">
    <ul>
      <!-- Dorins: Merkmal (z. B. slim, weit) aus Eigenschaft „Aktionen“ und Rabatt, wie im bisherigen Shop; nicht in der Verfügbarkeits-Anzeige, sonst doppelt -->
      <SfListItem
        v-if="!useAvailability && aktionBadge"
        size="sm"
        class="text-xs font-semibold select-none rounded-md !w-fit !cursor-default !px-2 mr-2 mb-2 text-white"
        :style="{ backgroundColor: aktionBadge.color }"
        data-testid="badge-aktion"
      >
        {{ aktionBadge.label }}
      </SfListItem>
      <SfListItem
        v-if="!useAvailability && discountPercent > 0"
        size="sm"
        class="text-xs font-semibold select-none rounded-md !w-fit !cursor-default !px-2 mr-2 mb-2 bg-white border"
        :style="{ color: SALE_COLOR, borderColor: SALE_COLOR }"
        data-testid="badge-discount"
      >
        % -{{ discountPercent }} %
      </SfListItem>
      <template v-if="useTags && productTags.length > 0">
        <SfListItem
          v-for="(tag, index) in productTags"
          :key="index"
          size="sm"
          class="text-xs font-medium select-none rounded-md !w-fit !px-2 opacity-75 mr-2 mb-2 cursor-pointer"
          :class="[
            tagGetters.getAgenciesTagCLass(tag),
            tagGetters.getTagTextColorIsDark(tag) ? 'text-dark' : 'text-white',
          ]"
          :style="{ backgroundColor: tagGetters.getTagBackgroundColor(tag) }"
          @click="onTagClick(tag)"
        >
          {{ tagGetters.getTagName(tag) }}
        </SfListItem>
      </template>

      <SfListItem
        v-if="useAvailability && productGetters.getAvailabilityName(product)"
        size="sm"
        class="text-xs font-medium select-none rounded-md !w-fit !cursor-text !px-2 grid mt-2"
        :class="[productGetters.getAgenciesAvailabilityCLass(product)]"
        :style="availabilityStyles"
      >
        {{ productGetters.getAvailabilityName(product) }}
      </SfListItem>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { SfListItem } from '@storefront-ui/vue';
import { type ProductTag, productGetters, tagGetters } from '@plentymarkets/shop-api';
import type { BadgesProps } from '~/components/ui/Badges/types';

const localePath = useLocalizedPath();

const { product, useTags = true, useAvailability = false } = defineProps<BadgesProps>();

// Eigenschaft 200 „Aktionen“: Wert „<Text> #<Farbe>“, z. B. „slim #D78E7F“
const AKTION_PROPERTY_ID = 200;
const SALE_COLOR = '#ff6060';

const aktionBadge = computed(() => {
  const property = (product?.variationProperties ?? [])
    .flatMap((group) => group.properties ?? [])
    .find((entry) => Number(entry.id) === AKTION_PROPERTY_ID);
  const value = (property?.values as { value?: string } | undefined)?.value?.trim() ?? '';
  const match = value.match(/^(.*?)\s*(#[0-9a-fA-F]{3,8})?$/);
  const label = match?.[1]?.trim() ?? '';
  return label ? { label, color: match?.[2] ?? '#c482b0' } : null;
});

const { price, crossedPrice } = useProductPrice(product);
const discountPercent = computed(() => {
  if (!crossedPrice.value || crossedPrice.value <= price.value) return 0;
  return Math.round(((crossedPrice.value - price.value) / crossedPrice.value) * 100);
});

const productTags = computed(() => {
  if (!useTags) return [];
  return tagGetters.getTags(product);
});

const availabilityStyles = computed(() => {
  if (!useAvailability) return {};

  return {
    backgroundColor: productGetters.getAvailabilityBackgroundColor(product),
    color: productGetters.getAvailabilityTextColor(product),
  };
});

const haveBadges = computed(
  () =>
    (!useAvailability && (!!aktionBadge.value || discountPercent.value > 0)) ||
    (useTags && productTags.value.length > 0) ||
    (useAvailability && productGetters.getAvailabilityName(product)),
);

const onTagClick = (tag: ProductTag) => {
  navigateTo(localePath(`/tag/${tagGetters.getTagName(tag)}_${tagGetters.getTagId(tag)}`));
};
</script>
