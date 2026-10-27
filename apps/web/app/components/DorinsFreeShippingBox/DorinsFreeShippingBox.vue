<template>
  <!-- Dorins: gerahmter Versandfrei-Kasten wie im bisherigen Shop (Warenkorb und Kasse) -->
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
</template>

<script setup lang="ts">
import { cartGetters } from '@plentymarkets/shop-api';

// Versandkostenfrei nur Deutschland ab 29,99 € Warenwert (brutto), wie FreeShippingBar
const FREE_SHIPPING_THRESHOLD = 29.99;

const { t } = useI18n();
const { data: cart, cartIsEmpty } = useCart();
const { format } = usePriceFormatter();

const subtotal = computed(() => cartGetters.getTotals(cart.value).subtotal);
const remaining = computed(() => Math.max(FREE_SHIPPING_THRESHOLD - subtotal.value, 0));
const qualifies = computed(() => subtotal.value >= FREE_SHIPPING_THRESHOLD);
const percent = computed(() => Math.min(100, Math.round((subtotal.value / FREE_SHIPPING_THRESHOLD) * 100)));
</script>
