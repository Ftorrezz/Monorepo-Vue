<template>
  <q-btn
    class="q-mr-xs"
    flat
    round
    @click="$q.dark.toggle()"
    :icon="$q.dark.isActive ? 'dark_mode' : 'light_mode'"
  >
    <q-tooltip>{{ $t($q.dark.isActive ? 'darkMode.toggleLight' : 'darkMode.toggleDark') }}</q-tooltip>
  </q-btn>
</template>

<script setup lang="ts">
import { useQuasar } from "quasar";
import { useI18n } from 'vue-i18n';

const $q = useQuasar();
const { t } = useI18n();
</script>
