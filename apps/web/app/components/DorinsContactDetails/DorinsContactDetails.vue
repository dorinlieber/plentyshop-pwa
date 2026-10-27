<template>
  <!-- Dorins: Kontaktdaten links neben dem Formular wie im bisherigen Shop -->
  <div class="dorins-contact-details" data-testid="dorins-contact-details">
    <div class="dorins-contact-row">
      <SfIconLocationOnFilled size="xs" aria-hidden="true" />
      <div>
        <p>Dorins Kindermode</p>
        <p>Schandauer Str. 26 A</p>
        <p>01309 Dresden</p>
      </div>
    </div>
    <p class="dorins-contact-row">
      <SfIconCall size="xs" aria-hidden="true" />
      <a href="tel:035128708090">0351 28708090</a>
    </p>
    <p class="dorins-contact-row">
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor">
        <path
          d="M6 2h9l3 3v4h1a3 3 0 0 1 3 3v8H2v-8a3 3 0 0 1 3-3h1V2Zm2 2v5h8V6h-2V4H8Zm-3 7a1 1 0 0 0-1 1v6h16v-6a1 1 0 0 0-1-1H5Zm2 2h4v2H7v-2Z"
        />
      </svg>
      <a href="fax:035128708091">0351 28708091</a>
    </p>
    <p class="dorins-contact-row">
      <SfIconEmail size="xs" aria-hidden="true" />
      <a href="mailto:kontakt@dorins-kindermode.de">kontakt@dorins-kindermode.de</a>
    </p>
  </div>
</template>

<script setup lang="ts">
import { SfIconCall, SfIconEmail, SfIconLocationOnFilled } from '@storefront-ui/vue';
</script>
