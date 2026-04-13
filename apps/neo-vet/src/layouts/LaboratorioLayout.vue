<template>
  <q-layout view="hHh Lpr lFf">
    <!-- HEADER MODERNO CON GRADIENTE -->
    <q-header flat class="lab-header">
      <q-toolbar class="header-toolbar">
        <!-- Botón de regreso -->
        <q-btn
          flat
          dense
          round
          icon="arrow_back"
          @click="volverAModulos"
          class="back-btn"
          title="Volver a módulos principales"
        />

        <!-- Logo y nombre del sistema -->
        <div class="brand-section">
          <img
            src="/static/VetDimioMenuMini.png"
            alt="Logo"
            class="logo-header cursor-pointer"
            @click="$router.push('/')"
          />
          <div class="brand-info">
            <div class="brand-name">VetDimio</div>
            <div class="brand-subtitle">Laboratorio Clínico</div>
          </div>
        </div>

        <q-separator vertical inset class="q-mx-md header-separator" />

        <!-- Navegación con pills modernos -->
        <div class="nav-pills">
          <button
            v-for="tab in navTabs"
            :key="tab.name"
            class="nav-pill"
            :class="{ 'nav-pill--active': tabActiva === tab.name }"
            @click="navegarA(tab)"
          >
            <q-icon :name="tab.icon" size="18px" />
            <span class="nav-pill__label">{{ tab.label }}</span>
          </button>
        </div>

        <q-space />

        <!-- Acciones rápidas -->
        <div class="header-actions">
          <q-btn
            round
            flat
            icon="notifications_none"
            class="action-icon-btn"
          >
            <q-badge color="red" floating rounded>3</q-badge>
            <q-tooltip>Notificaciones</q-tooltip>
          </q-btn>
        </div>

        <MenuOpcionesUsuario />
      </q-toolbar>
    </q-header>

    <!-- PAGE CONTAINER -->
    <q-page-container>
      <q-page class="lab-page-container">
        <router-view></router-view>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import MenuOpcionesUsuario from '../components/MenuOpcionesUsuario.vue';

const router = useRouter();
const route = useRoute();
const tabActiva = ref('home');

const navTabs = [
  { name: 'home', icon: 'dashboard', label: 'Dashboard', path: '/laboratorio/home' },
  { name: 'ordenes', icon: 'receipt_long', label: 'Órdenes', path: '/laboratorio' },
  { name: 'muestras', icon: 'science', label: 'Muestras', path: '/laboratorio/registro-muestras' },
  { name: 'resultados', icon: 'fact_check', label: 'Resultados', path: '/laboratorio/carga-resultados' },
  { name: 'catalogos', icon: 'tune', label: 'Configuración', path: '/laboratorio/admin-catalogos' },
  { name: 'reportes', icon: 'analytics', label: 'Reportes', path: '/laboratorio/reportes' },
  { name: 'inventario', icon: 'inventory_2', label: 'Inventario', path: '/laboratorio/inventario' },
];

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
  },
  { immediate: true }
);

const volverAModulos = () => {
  router.push('/');
};

const navegarA = (tab: { name: string; path: string }) => {
  tabActiva.value = tab.name;
  router.push(tab.path);
};


</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.lab-header {
  background: linear-gradient(135deg, #1a237e 0%, #283593 30%, #3949ab 60%, #448aff 100%);
  font-family: 'Inter', sans-serif;
}

.header-toolbar {
  min-height: 56px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
}

.back-btn {
  color: rgba(255, 255, 255, 0.85);
  transition: all 0.2s ease;

  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.15);
  }
}

.brand-section {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.logo-header {
  height: 36px;
  width: auto;
  border-radius: 8px;
  transition: transform 0.2s ease;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));

  &:hover {
    transform: scale(1.08);
  }
}

.brand-info {
  display: flex;
  flex-direction: column;

  .brand-name {
    font-size: 15px;
    font-weight: 700;
    color: white;
    letter-spacing: 0.5px;
    line-height: 1.1;
  }

  .brand-subtitle {
    font-size: 11px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.7);
    letter-spacing: 0.3px;
  }
}

.header-separator {
  opacity: 0.3;
  border-color: rgba(255, 255, 255, 0.3);
}

// ── NAVIGATION PILLS ──
.nav-pills {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
}

.nav-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  background: transparent;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  position: relative;
  outline: none;

  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.12);
  }

  &--active {
    color: #1a237e;
    background: white;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

    &:hover {
      color: #1a237e;
      background: white;
    }
  }

  &__label {
    letter-spacing: 0.2px;
  }
}

// ── HEADER ACTIONS ──
.header-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-right: 4px;
}

.action-icon-btn {
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;

  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.12);
  }
}

// ── PAGE CONTAINER ──
.lab-page-container {
  background: #f0f4f8;
  padding: 20px 24px;
  min-height: calc(100vh - 56px);
}

// ── RESPONSIVE ──
@media (max-width: 1200px) {
  .nav-pill__label {
    display: none;
  }

  .nav-pill {
    padding: 8px 10px;
  }
}

@media (max-width: 768px) {
  .brand-info {
    display: none;
  }

  .header-separator {
    display: none;
  }

  .nav-pills {
    overflow-x: auto;
    max-width: 50vw;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  .lab-page-container {
    padding: 12px;
  }
}
</style>
