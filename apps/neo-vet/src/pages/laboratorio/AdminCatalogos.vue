<template>
  <div class="admin-laboratorio">
    <!-- Cabecera -->
    <div class="page-header">
      <div class="header-content">
        <q-icon name="settings" size="40px" color="primary" class="q-mr-md" />
        <div>
          <h1 class="page-title">Administración de Catálogos Laboratoriales</h1>
          <p class="page-subtitle">Gestión de estudios, pruebas, valores de referencia y tipos de muestra</p>
        </div>
      </div>
    </div>

    <!-- Tabs con secciones -->
    <q-tabs
      v-model="tabActiva"
      dense
      class="tabs-section"
      active-color="primary"
      indicator-color="primary"
    >
      <!-- TAB 1: Estudios -->
      <q-tab name="estudios" label="Estudios" icon="science">
        <q-tab-panels v-model="tabActiva" animated>
          <q-tab-panel name="estudios">
            <AbmEstudios />
          </q-tab-panel>
        </q-tab-panels>
      </q-tab>

      <!-- TAB 2: Pruebas -->
      <q-tab name="pruebas" label="Pruebas / Tests" icon="analytics">
        <q-tab-panels v-model="tabActiva" animated>
          <q-tab-panel name="pruebas">
            <AbmPruebas />
          </q-tab-panel>
        </q-tab-panels>
      </q-tab>

      <!-- TAB 3: Valores de Referencia -->
      <q-tab name="valores" label="Valores de Referencia" icon="assessment">
        <q-tab-panels v-model="tabActiva" animated>
          <q-tab-panel name="valores">
            <AbmValoresReferencia />
          </q-tab-panel>
        </q-tab-panels>
      </q-tab>

      <!-- TAB 4: Tipos de Muestra -->
      <q-tab name="tipos" label="Tipos de Muestra" icon="invert_colors">
        <q-tab-panels v-model="tabActiva" animated>
          <q-tab-panel name="tipos">
            <AbmTiposMuestra />
          </q-tab-panel>
        </q-tab-panels>
      </q-tab>

      <!-- TAB 5: Dashboard -->
      <q-tab name="dashboard" label="Dashboard" icon="dashboard">
        <q-tab-panels v-model="tabActiva" animated>
          <q-tab-panel name="dashboard">
            <DashboardCatalogos />
          </q-tab-panel>
        </q-tab-panels>
      </q-tab>
    </q-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AbmEstudios from '../../components/laboratorio/catalogo/AbmEstudios.vue'
import AbmPruebas from '../../components/laboratorio/catalogo/AbmPruebas.vue'
import AbmValoresReferencia from '../../components/laboratorio/catalogo/AbmValoresReferencia.vue'
import AbmTiposMuestra from '../../components/laboratorio/catalogo/AbmTiposMuestra.vue'
import DashboardCatalogos from '../../components/laboratorio/catalogo/DashboardCatalogos.vue'

const tabActiva = ref('estudios')
</script>

<style scoped lang="scss">
.admin-laboratorio {
  background: #f5f5f5;
  min-height: 100vh;
  padding: 20px;
}

.page-header {
  background: white;
  padding: 30px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .header-content {
    display: flex;
    align-items: center;

    .page-title {
      margin: 0 0 5px 0;
      font-size: 28px;
      font-weight: 600;
      color: #333;
    }

    .page-subtitle {
      margin: 0;
      color: #999;
      font-size: 14px;
    }
  }
}

.tabs-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:deep(.q-tab-panels) {
  background: transparent;
  box-shadow: none;
  padding: 0;
}

:deep(.q-tab-panel) {
  padding: 0;
}
</style>
