<template>
  <q-btn
    flat
    round
    dense
    :icon="uiStore.menuType === 'horizontal' ? 'view_sidebar' : 'view_headline'"
    @click="uiStore.toggleMenuType"
    class="q-ml-sm menu-style-toggle"
  >
    <q-tooltip>
      {{ uiStore.menuType === 'horizontal' ? 'Cambiar a Menú Lateral' : 'Cambiar a Menú Horizontal' }}
    </q-tooltip>
  </q-btn>
</template>

<script setup lang="ts">
import { useUiStore } from '../stores/uiStore';

const uiStore = useUiStore();
</script>

<style scoped>
.menu-style-toggle {
  transition: transform 0.3s ease;
}
.menu-style-toggle:hover {
  transform: rotate(180deg);
}
</style>
