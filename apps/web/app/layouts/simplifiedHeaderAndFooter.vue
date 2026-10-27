<template>
  <div>
    <UiSimplifiedHeader />
    <main>
      <slot />
    </main>
    <NuxtLazyHydrate when-idle>
      <Cookiebar />
      <PreviewMode />
    </NuxtLazyHydrate>
    <!-- Dorins: Kasse ohne Fuß wie im bisherigen Shop (Rechtslinks stehen unter dem Kaufen-Knopf) -->
    <UiFooterBlocks v-if="!isCheckout" />
  </div>
</template>

<script setup lang="ts">
usePageTitle();
useStructuredData().setLogoMeta();

const route = useRoute();
const isCheckout = computed(() => String(route.name ?? '').startsWith('checkout'));
</script>
