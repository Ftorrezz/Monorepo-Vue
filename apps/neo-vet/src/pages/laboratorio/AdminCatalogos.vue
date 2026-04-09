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

    <!-- Contenedor principal con sidebar -->
    <div class="content-wrapper">
      <!-- Sidebar fijo -->
      <aside class="sidebar">
        <nav class="nav-options">
          <button
            v-for="seccion in secciones"
            :key="seccion.id"
            class="nav-item"
            :class="{ 'nav-item--active': tabActiva === seccion.id }"
            @click="tabActiva = seccion.id"
          >
            <q-icon :name="seccion.icon" class="nav-item__icon" />
            <span class="nav-item__label">{{ seccion.label }}</span>
            <q-icon name="arrow_forward" class="nav-item__arrow" />
          </button>
        </nav>
      </aside>

      <!-- Área de contenido principal -->
      <main class="main-content">
        <div class="content-panel">
          <AbmEstudios v-if="tabActiva === 'estudios'" />
          <AbmPruebas v-else-if="tabActiva === 'pruebas'" />
          <AbmValoresReferencia v-else-if="tabActiva === 'valores'" />
          <AbmTiposMuestra v-else-if="tabActiva === 'tipos'" />
          <DashboardCatalogos v-else-if="tabActiva === 'dashboard'" />
        </div>
      </main>
    </div>
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

const secciones = [
  { id: 'estudios', label: 'Estudios', icon: 'science' },
  { id: 'pruebas', label: 'Pruebas / Tests', icon: 'analytics' },
  { id: 'valores', label: 'Valores de Referencia', icon: 'assessment' },
  { id: 'tipos', label: 'Tipos de Muestra', icon: 'invert_colors' },
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' }
]
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

// Layout con sidebar
.content-wrapper {
  display: flex;
  gap: 20px;
  min-height: calc(100vh - 250px);
}

// Sidebar fijo
.sidebar {
  width: 240px;
  flex-shrink: 0;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: fit-content;
  position: sticky;
  top: 20px;
}

.nav-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
  text-align: left;

  &:hover {
    background-color: #f0f0f0;
    color: #1976d2;
    transform: translateX(4px);
  }

  &--active {
    background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
    color: white;
    font-weight: 600;

    .nav-item__arrow {
      opacity: 1;
    }

    &:hover {
      box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
      transform: translateX(6px);
    }
  }

  &__icon {
    font-size: 20px;
    flex-shrink: 0;
  }

  &__label {
    flex: 1;
    font-size: 13px;
  }

  &__arrow {
    font-size: 16px;
    opacity: 0;
    transition: opacity 0.2s ease;
  }
}

// Área de contenido principal
.main-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.content-panel {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

:deep(.content-panel > div) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

// Responsive
@media (max-width: 1024px) {
  .content-wrapper {
    flex-direction: column;
    gap: 16px;
  }

  .sidebar {
    width: 100%;
    position: relative;
    top: auto;
    height: auto;
  }

  .nav-options {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .nav-item {
    flex: 1;
    min-width: 150px;
  }
}

@media (max-width: 768px) {
  .admin-laboratorio {
    padding: 12px;
  }

  .page-header {
    padding: 20px;
  }

  .nav-item {
    justify-content: center;

    &__label {
      display: none;
    }
  }

  .nav-item--active .nav-item__label {
    display: block;
  }
}
</style>
