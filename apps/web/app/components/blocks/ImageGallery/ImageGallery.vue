<template>
  <section class="grid-in-left-top @md:h-full @xl:max-h-[700px] relative">
    <!-- Dorins: Abzeichen (slim, Rabatt) oben links auf dem Hauptbild wie im bisherigen Shop -->
    <UiBadges :product="currentProduct" :use-tags="true" class="absolute top-0 left-0 m-2 z-10" />
    <Gallery
      :images="addModernImageExtensionForGallery(productGetters.getGallery(currentProduct))"
      :configuration="content"
    />
  </section>
</template>

<script setup lang="ts">
import { productGetters } from '@plentymarkets/shop-api';
import type { ImageGalleryProps } from '~/components/blocks/ImageGallery/types';

const { addModernImageExtensionForGallery } = useModernImage();

defineProps<ImageGalleryProps>();
const { currentProduct } = useProducts();
</script>
