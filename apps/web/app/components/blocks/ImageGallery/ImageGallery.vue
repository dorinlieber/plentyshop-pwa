<template>
  <!-- Dorins: ohne Höhenbegrenzung, die Reiter stehen unter den Bildern -->
  <section class="grid-in-left-top relative">
    <!-- Dorins: am Handy steht der Titel wie im bisherigen Shop über dem Bild (Kaufbox-Titel dort ausgeblendet) -->
    <p class="dorins-mobile-title">{{ displayName }}</p>
    <div class="relative">
      <!-- Dorins: Abzeichen (slim, Rabatt) oben links auf dem Hauptbild wie im bisherigen Shop -->
      <UiBadges :product="currentProduct" :use-tags="true" class="absolute top-0 left-0 m-2 z-10" />
      <Gallery
        :images="addModernImageExtensionForGallery(productGetters.getGallery(currentProduct))"
        :configuration="content"
      />
    </div>
    <DorinsProductTabs :product="currentProduct" />
  </section>
</template>

<script setup lang="ts">
import { productGetters } from '@plentymarkets/shop-api';
import type { ImageGalleryProps } from '~/components/blocks/ImageGallery/types';

const { addModernImageExtensionForGallery } = useModernImage();

defineProps<ImageGalleryProps>();
const { currentProduct } = useProducts();
const { displayName } = useDorinsProductTitle(currentProduct);
</script>
