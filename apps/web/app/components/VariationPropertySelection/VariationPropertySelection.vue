<template>
  <div v-if="value" class="w-full flex flex-col variation-property-selection @md/variationProperties:flex-row">
    <div v-if="name" class="font-semibold mr-1">
      <span>{{ name }}</span>
      <span>:</span>
    </div>
    <div>{{ value }}</div>
  </div>
</template>

<script setup lang="ts">
import { productPropertyGetters } from '@plentymarkets/shop-api';
import type { VariationProperty } from '@plentymarkets/shop-api';

const props = defineProps<{ variationProperty: VariationProperty }>();

const name = computed(() => productPropertyGetters.getPropertyName(props.variationProperty));

// Auswahl liefert ein Objekt { value }, Mehrfachauswahl eine Liste davon
const value = computed(() => {
  const values = (props.variationProperty as { values?: unknown }).values;
  if (Array.isArray(values)) {
    return values
      .map((entry) => (entry as { value?: string }).value)
      .filter(Boolean)
      .join(', ');
  }
  return (values as { value?: string } | undefined)?.value ?? '';
});
</script>
