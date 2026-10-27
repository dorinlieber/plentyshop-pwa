<template>
  <!-- Dorins: Warenkorb rechts wie im bisherigen Shop: Lieferland, Versandfrei-Hinweis, Summe netto/brutto, Gutschein, Kasse -->
  <div class="dorins-cart-summary" data-testid="dorins-cart-summary">
    <h3 class="dorins-cart-heading">{{ t('dorins.cartPage.country') }}</h3>
    <div class="dorins-cart-country">{{ countryName }}</div>

    <DorinsFreeShippingBox />

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

const { t } = useI18n();
const { data: cart } = useCart();
const { format } = usePriceFormatter();
const { localeCountryName } = useAggregatedCountries();

const totals = computed(() => cartGetters.getTotals(cart.value));

// Summen-Tabelle wie LTS: Warenwert und Versand je netto/brutto, MwSt., Gesamtsumme netto/brutto
const sumRows = computed(() => {
  const c = cart.value;
  const money = (amount: number) => format(amount) ?? '';
  const vats = (totals.value.totalVats ?? []) as Parameters<typeof cartGetters.getTotalVatValue>[0][];
  const rows: SumRow[] = [
    { label: t('dorins.cartPage.itemsNet'), value: money(cartGetters.getItemSumNet(c)) },
    { label: t('dorins.cartPage.itemsGross'), value: money(totals.value.subtotal), strong: true },
    { label: t('dorins.cartPage.shippingNet'), value: money(cartGetters.getShippingAmountNet(c)) },
    { label: t('dorins.cartPage.shippingGross'), value: money(cartGetters.getShippingPrice(c)), strong: true },
  ];
  if (cartGetters.getCouponDiscount(c)) {
    rows.push({ label: t('coupon.name'), value: money(cartGetters.getCouponDiscount(c)) });
  }
  vats.forEach((vat, index: number) =>
    rows.push({
      label: t('dorins.cartPage.vat', { rate: cartGetters.getTotalVatValue(vat) }),
      value: money(cartGetters.getTotalVatAmount(vat)),
      gap: index === 0,
    }),
  );
  rows.push(
    { label: t('dorins.cartPage.totalNet'), value: money(cartGetters.getBasketAmountNet(c)), gap: true },
    { label: t('dorins.cartPage.totalGross'), value: money(totals.value.total), strong: true },
  );
  return rows;
});

// Lieferland ergibt sich im neuen Shop aus der Lieferadresse in der Kasse; hier nur anzeigen (Standard Deutschland)
const countryName = computed(() => {
  const id = cartGetters.getShippingCountryId(cart.value);
  return (id && localeCountryName(String(id))) || t('dorins.cartPage.germany');
});
</script>
