<template>
  <!-- Dorins: Reiter unter den Bildern wie im bisherigen Shop (Beschreibung, Produktdetails, Material & Pflege, Hersteller) -->
  <div v-if="tabs.length" class="dorins-tabs" data-testid="dorins-product-tabs">
    <div class="dorins-tabs-labels" role="tablist">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        role="tab"
        :aria-selected="activeTab === tab.key"
        :class="['dorins-tabs-label', { 'dorins-tabs-label--active': activeTab === tab.key }]"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="dorins-tabs-panel" role="tabpanel">
      <!-- eigene Typografie statt „no-preflight“, die Überschriften sonst fett wie im Browser-Standard zeigt -->
      <div v-if="activeTab === 'description'" class="dorins-tabs-description" v-html="description" />

      <ul v-else-if="activeTab === 'details'">
        <li v-for="(row, index) in details" :key="index">
          <strong v-if="row.name">{{ row.name }}</strong> {{ row.value }}
        </li>
      </ul>

      <ul v-else-if="activeTab === 'material'">
        <li v-for="(row, index) in material" :key="index">
          <strong>{{ row.name }}</strong> {{ row.value }}
        </li>
      </ul>

      <div v-else-if="activeTab === 'manufacturer'" class="dorins-gpsr" data-nosnippet>
        <ul v-if="responsible.length">
          <li><strong>{{ t('dorins.euResponsible') }}</strong></li>
          <li v-for="(line, index) in responsible" :key="index">{{ line }}</li>
        </ul>
        <ul v-if="manufacturerName">
          <li><strong>{{ t('dorins.manufacturer') }}</strong></li>
          <li>{{ manufacturerName }}</li>
        </ul>
      </div>
    </div>

    <div v-if="careSymbols.length" class="dorins-care">
      <h2>{{ t('dorins.careInstructions') }}</h2>
      <span v-for="(symbol, index) in careSymbols" :key="index" class="dorins-care-item">
        <i v-if="symbol.icon" :class="symbol.icon" aria-hidden="true" />
        <span>{{ symbol.label }}</span>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { productGetters, productPropertyGetters } from '@plentymarkets/shop-api';
import type { Product, VariationProperty } from '@plentymarkets/shop-api';

const props = defineProps<{ product: Product }>();
const { t } = useI18n();

// Eigenschaften wie im LTS verteilt: Material (69) im eigenen Reiter, Pflegesymbole (245) als Symbole darunter,
// Bullet Points (Gruppe 27) ohne Namen unter den Produktdetails; interne Gruppen und Jahreszeit (202) nie
const MATERIAL_PROPERTY_ID = 69;
const CARE_PROPERTY_ID = 245;
const BULLET_POINT_GROUP_ID = 27;
const HIDDEN_PROPERTY_IDS = new Set([202, MATERIAL_PROPERTY_ID, CARE_PROPERTY_ID]);
const HIDDEN_GROUP_IDS = new Set([3, 6, 30]);

type PropertyValue = { value?: string; description?: string };
const valuesOf = (property: VariationProperty): PropertyValue[] => {
  const values = (property as { values?: PropertyValue | PropertyValue[] }).values;
  if (!values) return [];
  return Array.isArray(values) ? values : [values];
};
const textOf = (property: VariationProperty) =>
  valuesOf(property)
    .map((entry) => entry.value)
    .filter(Boolean)
    .join(', ');

const groups = computed(() => productGetters.getPropertyGroups(props.product));
const allProperties = computed(() => groups.value.flatMap((group) => group.properties ?? []));

const description = computed(() => productGetters.getDescription(props.product));

const details = computed(() => {
  const rows: { name: string; value: string }[] = [];
  const bullets: { name: string; value: string }[] = [];
  for (const group of groups.value) {
    if (HIDDEN_GROUP_IDS.has(Number(group.id))) continue;
    for (const property of group.properties ?? []) {
      const value = textOf(property);
      if (!value) continue;
      if (Number(group.id) === BULLET_POINT_GROUP_ID) {
        bullets.push({ name: '', value });
        continue;
      }
      const cast = productPropertyGetters.getPropertyCast(property);
      if (HIDDEN_PROPERTY_IDS.has(property.id) || (cast !== 'selection' && cast !== 'multiSelection')) continue;
      rows.push({ name: productPropertyGetters.getPropertyName(property).replace(/:+$/, ''), value });
    }
  }
  return [...rows, ...bullets];
});

const material = computed(() =>
  allProperties.value
    .filter((property) => property.id === MATERIAL_PROPERTY_ID && textOf(property))
    .map((property) => ({ name: productPropertyGetters.getPropertyName(property), value: textOf(property) })),
);

// Symbol-Klasse (z. B. icon-10) steht in plenty in der Beschreibung des Auswahlwerts, wie im LTS-Template
const careSymbols = computed(() => {
  const care = allProperties.value.find((property) => property.id === CARE_PROPERTY_ID);
  if (!care) return [];
  return valuesOf(care)
    .filter((entry) => entry.value)
    .map((entry) => ({
      label: entry.value ?? '',
      icon: /^icon-\d+$/.test(entry.description ?? '') ? entry.description : '',
    }));
});

type ManufacturerData = {
  name?: string;
  externalName?: string;
  responsibleName?: string;
  responsibleStreet?: string;
  responsibleHouseNo?: string;
  responsiblePostCode?: string;
  responsibleTown?: string;
  responsibleEmail?: string;
  responsiblePhoneNo?: string;
};
const manufacturer = computed(() => (productGetters.getManufacturer(props.product) ?? {}) as ManufacturerData);
const manufacturerName = computed(() => manufacturer.value.externalName || manufacturer.value.name || '');
const responsible = computed(() => {
  const m = manufacturer.value;
  const street = [m.responsibleStreet, m.responsibleHouseNo].filter(Boolean).join(' ');
  const town = [m.responsiblePostCode, m.responsibleTown].filter(Boolean).join(' ');
  return [m.responsibleName, [street, town].filter(Boolean).join(', '), m.responsibleEmail, m.responsiblePhoneNo].filter(
    (line): line is string => !!line,
  );
});

const tabs = computed(() =>
  [
    { key: 'description', label: t('dorins.tabDescription'), show: !!description.value },
    { key: 'details', label: t('dorins.tabDetails'), show: details.value.length > 0 },
    { key: 'material', label: t('dorins.tabMaterial'), show: material.value.length > 0 },
    { key: 'manufacturer', label: t('dorins.tabManufacturer'), show: responsible.value.length > 0 || !!manufacturerName.value },
  ].filter((tab) => tab.show),
);
const activeTab = ref('description');
watch(
  tabs,
  (list) => {
    if (list.length && !list.some((tab) => tab.key === activeTab.value)) activeTab.value = list[0]!.key;
  },
  { immediate: true },
);
</script>
