<template>
  <q-btn
    class="q-mr-xs"
    flat
    round
    @click="$q.dark.toggle()"
    :icon="$q.dark.isActive ? 'dark_mode' : 'light_mode'"
  />
</template>

<script setup lang="ts">
import { useQuasar } from "quasar";

const $q = useQuasar();
</script>
