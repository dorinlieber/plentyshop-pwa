<template>
  <div v-for="(group, groupIndex) in variationPropertyGroups" :key="`group-${groupIndex}`">
    <template v-for="(variationProperty, propIndex) in group.properties" :key="`group-prop-${propIndex}`">
      <div
        v-if="showProperty(variationProperty)"
        class="flex items-center variation-properties @container/variationProperties"
      >
        <ClientOnly>
          <Component
            :is="componentsMapper[productPropertyGetters.getPropertyCast(variationProperty)]"
            v-if="componentsMapper[productPropertyGetters.getPropertyCast(variationProperty)]"
            :variation-property="variationProperty"
          />
        </ClientOnly>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { productGetters, productPropertyGetters } from '@plentymarkets/shop-api';
import type { Product, VariationProperty } from '@plentymarkets/shop-api';
import type { VariationPropertiesProps, ComponentsMapper } from './types';
import VariationPropertyText from '~/components/VariationPropertyText/VariationPropertyText.vue';
import VariationPropertyHtml from '~/components/VariationPropertyHtml/VariationPropertyHtml.vue';
import VariationPropertyDate from '~/components/VariationPropertyDate/VariationPropertyDate.vue';
import VariationPropertyFile from '../VariationPropertyFile/VariationPropertyFile.vue';
import VariationPropertySelection from '~/components/VariationPropertySelection/VariationPropertySelection.vue';

// Interne Eigenschaftsgruppen (Marktplatz-Texte, Keywords, Badge-Steuerung), nie für Kunden anzeigen.
// 27 Bullet Points, 6 Amazon Titel + Feld 3 (u. a. Limango-Titel), 3 Keywords, 30 Webshop Aktionen
const HIDDEN_PROPERTY_GROUP_IDS = new Set([27, 6, 3, 30]);

const props = defineProps<VariationPropertiesProps>();
const propertyHasNameOrValue = (variationProperty: VariationProperty) => {
  return (
    productPropertyGetters.getPropertyName(variationProperty) ||
    productPropertyGetters.getPropertyValue(variationProperty)
  );
};

const { getNumberSetting } = useSiteSettings('itemCanonicalId');
const itemCanonicalId = computed(() => getNumberSetting(-1));

const variationPropertyGroups = computed(() =>
  productGetters
    .getPropertyGroups(props.product ?? ({} as Product))
    .filter((group) => !HIDDEN_PROPERTY_GROUP_IDS.has(Number(group.id))),
);

const showProperty = (property: VariationProperty) => {
  return propertyHasNameOrValue(property) && property.id !== itemCanonicalId.value;
};

const componentsMapper: ComponentsMapper = {
  text: VariationPropertyText,
  int: VariationPropertyText,
  float: VariationPropertyText,
  file: VariationPropertyFile,
  string: VariationPropertyText,
  html: VariationPropertyHtml,
  date: VariationPropertyDate,
  selection: VariationPropertySelection,
  multiSelection: VariationPropertySelection,
};
</script>
