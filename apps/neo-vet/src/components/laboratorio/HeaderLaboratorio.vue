<template>
  <q-tabs
    v-model="tabActiva"
    dense
    class="tabs-inline text-white"
    active-color="white"
    indicator-color="white"
    align="left"
    no-caps
  >
    <q-tab
      name="home"
      icon="dashboard"
      label="Dashboard"
      @click="$router.push('/laboratorio/home')"
    />
    <q-tab
      name="ordenes"
      icon="receipt"
      label="Órdenes"
      @click="$router.push('/laboratorio')"
    />
    <q-tab
      name="muestras"
      icon="local_shipping"
      label="Muestras"
      @click="$router.push('/laboratorio/registro-muestras')"
    />
    <q-tab
      name="resultados"
      icon="check_circle"
      label="Resultados"
      @click="$router.push('/laboratorio/carga-resultados')"
    />
    <q-tab
      name="catalogos"
      icon="settings"
      label="Configuración"
      @click="$router.push('/laboratorio/admin-catalogos')"
    />
    <q-tab
      name="reportes"
      icon="assessment"
      label="Reportes"
      @click="$router.push('/laboratorio/reportes')"
    />
    <q-tab
      name="inventario"
      icon="inventory"
      label="Inventario"
      @click="$router.push('/laboratorio/inventario')"
    />
  </q-tabs>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const tabActiva = ref('home');

watch(
  () => route.path,
  (newPath) => {
    if (newPath.includes('/home')) tabActiva.value = 'home';
    else if (newPath.includes('/carga-resultados')) tabActiva.value = 'resultados';
    else if (newPath.includes('/registro-muestras')) tabActiva.value = 'muestras';
    else if (newPath.includes('/admin-catalogos')) tabActiva.value = 'catalogos';
    else if (newPath.includes('/reportes')) tabActiva.value = 'reportes';
    else if (newPath.includes('/inventario')) tabActiva.value = 'inventario';
    else if (newPath === '/laboratorio' || newPath.includes('/laboratorio/orden')) tabActiva.value = 'ordenes';
  }
);
</script>

<style lang="scss" scoped>
.tabs-inline {
  background-color: transparent;
  
  :deep(.q-tab) {
    padding: 12px 16px;
    font-size: 12px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    color: rgba(255, 255, 255, 0.8);
    transition: color 0.2s ease;

    &:hover {
      color: white;
      background-color: rgba(255, 255, 255, 0.1);
    }

    &.q-tab--active {
      color: white;
    }
  }

  :deep(.q-tab__indicator) {
    height: 3px;
    border-radius: 1.5px;
  }
}
</style>
