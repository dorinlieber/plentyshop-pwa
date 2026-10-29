<template>
  <!-- Dorins: Versand-heute-Hinweis wie das DeliveryTimeWidget im bisherigen Shop, erst im Browser, weil uhrzeitabhängig -->
  <div v-if="state" class="dorins-shipping-countdown" data-testid="dorins-shipping-countdown">
    <div>
      <div>
        <i18n-t v-if="state.today" keypath="dorins.shippingCountdown.today" tag="div" scope="global">
          <template #countdown>
            <SfIconSchedule size="sm" class="dorins-shipping-countdown-icon" />
            <strong>{{ state.countdown }}</strong>
          </template>
        </i18n-t>
        <i18n-t v-else keypath="dorins.shippingCountdown.later" tag="div" scope="global">
          <template #truck>
            <SfIconLocalShipping size="sm" class="dorins-shipping-countdown-icon" />
          </template>
          <template #day>
            <strong>{{ state.day }}</strong>
          </template>
        </i18n-t>
        <small>{{ t('dorins.shippingCountdown.note') }}</small>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '@plentymarkets/shop-api';
import { productGetters } from '@plentymarkets/shop-api';
import { SfIconLocalShipping, SfIconSchedule } from '@storefront-ui/vue';
import { berlinNow, shippingInfo } from './shippingDays';

const props = defineProps<{ product: Product }>();

// Wie im bisherigen Shop: nur bei Verfügbarkeit 1 (sofort lieferbar)
const AVAILABILITY_IDS = [1];

const { t, locale } = useI18n();
const now = ref<Date | null>(null);
let timer: ReturnType<typeof setInterval> | undefined;

onMounted(() => {
  now.value = new Date();
  timer = setInterval(() => (now.value = new Date()), 30_000);
});
onBeforeUnmount(() => clearInterval(timer));

const state = computed(() => {
  if (!now.value || !AVAILABILITY_IDS.includes(productGetters.getAvailabilityId(props.product))) return null;
  const info = shippingInfo(berlinNow(now.value));
  if (info.minutesLeft !== null) {
    // wie im LTS: ab einer Stunde „1:42 Std.“, darunter „39 Minuten“ / „1 Minute“
    if (info.minutesLeft < 60) {
      return { today: true, countdown: t('dorins.shippingCountdown.minutes', info.minutesLeft) };
    }
    const minutes = String(info.minutesLeft % 60).padStart(2, '0');
    return {
      today: true,
      countdown: `${Math.floor(info.minutesLeft / 60)}:${minutes} ${t('dorins.shippingCountdown.hours')}`,
    };
  }
  const day =
    info.daysAhead === 1
      ? t('dorins.shippingCountdown.tomorrow')
      : new Intl.DateTimeFormat(locale.value, { weekday: 'long', timeZone: 'UTC' }).format(info.shipDate);
  return { today: false, day };
});
</script>
