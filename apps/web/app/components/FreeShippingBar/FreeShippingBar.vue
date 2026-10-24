<!--
  FreeShippingBar.vue  —  "Nur noch X € bis zum kostenlosen Versand" für den plentyShop PWA
  ------------------------------------------------------------------------------------------
  Nachbau des LTS-Warenkorb-Balkens (<free-shipping :germany="29.99">) als echte Vue-Komponente.
  Passt zum plentyShop PWA (Nuxt 4 + Vue 3 + Tailwind/Storefront UI, @plentymarkets/shop-api).

  Regel Dorins Kindermode: versandkostenfrei nur Deutschland ab 29,99 € (seit 14.09.2026, von Dorin
  am 24.10.2026 als gültige Grenze bestätigt). Basis = Warenwert (itemSum, brutto).

  Verwendung (z. B. auf der Warenkorb-Seite oder im Warenkorb-Drawer):
    <FreeShippingBar />                        // Standard 29,99 €
    <FreeShippingBar :threshold="60" />        // abweichende Grenze
  Ort im Repo (Git-Integration): apps/web/app/components/FreeShippingBar/FreeShippingBar.vue
  i18n-Schlüssel unten in de.json / en.json ergänzen.
-->
<template>
  <div
    v-if="show"
    data-testid="free-shipping-bar"
    class="rounded-md border border-neutral-200 bg-neutral-50 px-4 py-3"
  >
    <p class="mb-2 text-center text-sm text-neutral-900">
      <span v-if="qualifies" class="font-medium text-positive-700">
        {{ t('freeShipping.qualified') }}
      </span>
      <span v-else>
        {{ t('freeShipping.remaining', { amount: formattedRemaining }) }}
      </span>
    </p>

    <div
      class="h-2 w-full overflow-hidden rounded-full bg-neutral-200"
      role="progressbar"
      :aria-valuenow="percent"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <div
        class="h-full rounded-full bg-primary-700 transition-[width] duration-500 ease-out"
        :style="{ width: percent + '%' }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { cartGetters } from '@plentymarkets/shop-api';

const props = withDefaults(
  defineProps<{
    /** Versandkostenfrei-Grenze in € (Warenwert). Default 29.99. */
    threshold?: number;
  }>(),
  { threshold: 29.99 },
);

const { t } = useI18n();
const { data: cart, cartIsEmpty } = useCart();
const { format } = usePriceFormatter();

/** Warenwert (itemSum, brutto) — das ist die Basis für die Versandfrei-Grenze. */
const goodsValue = computed(() => cartGetters.getTotals(cart.value).subtotal);

const remaining = computed(() => Math.max(props.threshold - goodsValue.value, 0));
const qualifies = computed(() => goodsValue.value >= props.threshold);
const percent = computed(() =>
  props.threshold > 0 ? Math.min(100, Math.round((goodsValue.value / props.threshold) * 100)) : 0,
);
const formattedRemaining = computed(() => format(remaining.value));

/** Nur zeigen, wenn der Warenkorb nicht leer ist. */
const show = computed(() => !cartIsEmpty.value);
</script>
