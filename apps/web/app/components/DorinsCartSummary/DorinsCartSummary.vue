<template>
  <!-- Dorins: Warenkorb rechts wie im bisherigen Shop: Lieferland, Versandfrei-Hinweis, Summe netto/brutto, Gutschein, Kasse -->
  <div class="dorins-cart-summary" data-testid="dorins-cart-summary">
    <h3 class="dorins-cart-heading">{{ t('dorins.cartPage.country') }}</h3>
    <div class="dorins-cart-country">{{ countryName }}</div>

    <div v-if="!cartIsEmpty" class="dorins-cart-free" data-testid="dorins-cart-free-shipping">
      <DorinsIcon name="truck" class="dorins-cart-free-icon" />
      <div class="dorins-cart-free-text">
        <p v-if="qualifies">{{ t('dorins.cartPage.freeShippingReached') }}</p>
        <i18n-t v-else keypath="dorins.cartPage.freeShippingRemaining" tag="p" scope="global">
          <template #amount>
            <strong>{{ format(remaining) }}</strong>
          </template>
          <template #free>
            <strong>{{ t('dorins.cartPage.freeShipping') }}</strong>
          </template>
        </i18n-t>
        <div
          class="dorins-cart-free-bar"
          role="progressbar"
          :aria-valuenow="percent"
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <span :style="{ width: `${percent}%` }" />
        </div>
        <p class="dorins-cart-free-note">{{ t('dorins.cartPage.freeShippingNote') }}</p>
      </div>
    </div>

    <h3 class="dorins-cart-heading">{{ t('dorins.cartPage.sum') }}</h3>
    <div class="dorins-cart-sums">
      <div
        v-for="row in sumRows"
        :key="row.label"
        :class="['dorins-cart-row', { 'dorins-strong': row.strong, 'dorins-cart-row--gap': row.gap }]"
      >
        <span>{{ row.label }}</span>
        <span>{{ row.value }}</span>
      </div>
    </div>

    <h3 class="dorins-cart-subheading">{{ t('coupon.name') }}</h3>
    <p class="dorins-cart-small">{{ t('dorins.cartPage.couponHint') }}</p>
    <Coupon expanded class="dorins-cart-coupon" />

    <slot />
  </div>
</template>

<script setup lang="ts">
import { cartGetters } from '@plentymarkets/shop-api';
import type { SumRow } from './types';

// Versandkostenfrei nur Deutschland ab 29,99 € Warenwert (brutto), wie FreeShippingBar
const FREE_SHIPPING_THRESHOLD = 29.99;

const { t } = useI18n();
const { data: cart, cartIsEmpty } = useCart();
const { format } = usePriceFormatter();
const { localeCountryName } = useAggregatedCountries();

const totals = computed(() => cartGetters.getTotals(cart.value));
const remaining = computed(() => Math.max(FREE_SHIPPING_THRESHOLD - totals.value.subtotal, 0));
const qualifies = computed(() => totals.value.subtotal >= FREE_SHIPPING_THRESHOLD);
const percent = computed(() => Math.min(100, Math.round((totals.value.subtotal / FREE_SHIPPING_THRESHOLD) * 100)));

// Summen-Tabelle wie LTS: Warenwert und Versand je netto/brutto, MwSt., Gesamtsumme netto/brutto
const sumRows = computed(() => {
  const c = cart.value;
  const rows: SumRow[] = [
    { label: t('dorins.cartPage.itemsNet'), value: format(cartGetters.getItemSumNet(c)) },
    { label: t('dorins.cartPage.itemsGross'), value: format(totals.value.subtotal), strong: true },
    { label: t('dorins.cartPage.shippingNet'), value: format(cartGetters.getShippingAmountNet(c)) },
    { label: t('dorins.cartPage.shippingGross'), value: format(cartGetters.getShippingPrice(c)), strong: true },
  ];
  if (cartGetters.getCouponDiscount(c)) {
    rows.push({ label: t('coupon.name'), value: format(cartGetters.getCouponDiscount(c)) });
  }
  totals.value.totalVats.forEach((vat, index) =>
    rows.push({
      label: t('dorins.cartPage.vat', { rate: cartGetters.getTotalVatValue(vat) }),
      value: format(cartGetters.getTotalVatAmount(vat)),
      gap: index === 0,
    }),
  );
  rows.push(
    { label: t('dorins.cartPage.totalNet'), value: format(cartGetters.getBasketAmountNet(c)), gap: true },
    { label: t('dorins.cartPage.totalGross'), value: format(totals.value.total), strong: true },
  );
  return rows;
});

// Lieferland ergibt sich im neuen Shop aus der Lieferadresse in der Kasse; hier nur anzeigen (Standard Deutschland)
const countryName = computed(() => {
  const id = cartGetters.getShippingCountryId(cart.value);
  return (id && localeCountryName(String(id))) || t('dorins.cartPage.germany');
});
</script>
