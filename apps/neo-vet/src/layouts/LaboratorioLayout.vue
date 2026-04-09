<template>
  <q-layout view="hHr lRr fFf" class="laboratorio-layout">
    <!-- Header Laboratorio -->
    <q-header elevated class="laboratorio-header">
      <div class="header-content">
        <div class="logo-section">
          <q-icon name="science" size="32px" color="white" />
          <div class="logo-text">
            <div class="logo-title">Módulo de Laboratorio</div>
            <div class="logo-subtitle">Gestión de Órdenes, Muestras y Resultados</div>
          </div>
        </div>

        <div class="header-actions">
          <q-btn
            flat
            round
            dense
            icon="home"
            color="white"
            @click="irAHome"
            unelevated
          >
            <q-tooltip>Ir al inicio de laboratorio</q-tooltip>
          </q-btn>
          <q-separator vertical inset class="q-mx-md" style="background-color: rgba(255,255,255,0.3)" />
          <q-btn
            flat
            round
            dense
            icon="pets"
            color="white"
            @click="irAVeterinaria"
            unelevated
          >
            <q-tooltip>Volver a Veterinaria</q-tooltip>
          </q-btn>
          <q-separator vertical inset class="q-mx-md" style="background-color: rgba(255,255,255,0.3)" />
          <q-btn
            flat
            round
            dense
            icon="arrow_back"
            color="white"
            @click="volverAlMenu"
            unelevated
          >
            <q-tooltip>Volver al menú principal</q-tooltip>
          </q-btn>
        </div>
      </div>

      <!-- Navbar de Laboratorio -->
      <q-tabs
        v-model="tabActiva"
        dense
        class="text-white"
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
    </q-header>

    <!-- Contenido -->
    <q-page-container>
      <q-page class="laboratorio-page">
        <router-view></router-view>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const tabActiva = ref('home');

// Actualizar tab activa según la ruta
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

const irAHome = () => {
  router.push('/laboratorio/home');
};

const irAVeterinaria = () => {
  router.push('/atencionpaciente');
};

const volverAlMenu = () => {
  router.push('/');
};
</script>

<style lang="scss" scoped>
:deep(.laboratorio-layout) {
  .q-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  }
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 100%;
  width: 100%;
  padding: 8px 0;

  .logo-section {
    display: flex;
    align-items: center;
    gap: 16px;

    .logo-text {
      .logo-title {
        font-size: 18px;
        font-weight: 600;
        letter-spacing: 0.3px;
        color: white;
        margin: 0;
      }

      .logo-subtitle {
        font-size: 12px;
        opacity: 0.9;
        margin-top: 2px;
        color: white;
      }
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.laboratorio-page {
  background-color: #f5f5f5;
  padding: 24px;
  width: 100%;
  min-height: 100vh;
}

:deep(.q-tabs) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);

  .q-tab {
    color: rgba(255, 255, 255, 0.8) !important;
    font-weight: 500;

    &.q-tab--active {
      color: white !important;
    }
  }

  .q-tabs__content {
    color: white !important;
  }

  .q-tab__indicator {
    background-color: white !important;
  }
}

// Responsivo
@media (max-width: 600px) {
  .header-content {
    gap: 12px;

    .logo-section {
      gap: 12px;

      .logo-text {
        .logo-title {
          font-size: 16px;
        }

        .logo-subtitle {
          font-size: 11px;
        }
      }
    }
  }

  .laboratorio-page {
    padding: 12px;
  }
}
</style>
