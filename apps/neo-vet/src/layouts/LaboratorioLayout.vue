<template>
  <q-layout view="hHh Lpr lFf">
    <!-- HEADER -->
    <q-header flat class="bg-primary shadow-2">
      <q-toolbar class="header-toolbar">
        <!-- Botón de regreso -->
        <q-btn
          flat
          dense
          round
          icon="arrow_back"
          @click="volverAModulos"
          class="q-mr-md"
          title="Volver a módulos principales"
        />

        <!-- Identificador del Módulo -->
        <div class="module-header-title">
          <q-icon name="science" size="24px" class="q-mr-xs" />
          <span class="text-weight-bold text-uppercase">Laboratorio</span>
        </div>

        <q-separator vertical inset class="q-mx-md" />

        <!-- Logo y nombre del sistema -->
        <div class="row items-center q-gutter-md">
          <img
            src="/static/VetDimioMenuMini.png"
            alt="Logo"
            class="logo-header cursor-pointer"
            @click="$router.push('/')"
          />
          <div class="system-info">
            <div class="system-name text-weight-bold">VetDimio</div>
            <div class="system-module text-weight-bold">Sistema integral de gestión veterinaria</div>
          </div>
        </div>

        <!-- Pestañas de navegación -->
        <div class="nav-tabs">
          <HeaderLaboratorio />
        </div>

        <!-- Botones de acción rápida -->
        <!--<div class="quick-actions row items-center q-gutter-sm">
          <q-btn 
            push 
            color="white" 
            text-color="primary" 
            label="Nueva Orden" 
            icon="add_circle" 
            @click="irA('/laboratorio')"
            no-caps 
            size="sm"
          />
          <q-btn 
            push 
            color="positive" 
            text-color="white" 
            label="Ver Resultados" 
            icon="check_circle" 
            @click="irA('/laboratorio/carga-resultados')"
            no-caps 
            size="sm"
          />
        </div>-->
        
        <q-space />
        
        <MenuOpcionesUsuario />
      </q-toolbar>
    </q-header>

    <!-- PAGE CONTAINER -->
    <q-page-container>
      <q-page class="q-pa-md">
        <router-view></router-view>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import HeaderLaboratorio from '../components/laboratorio/HeaderLaboratorio.vue';
import MenuOpcionesUsuario from '../components/MenuOpcionesUsuario.vue';

const router = useRouter();

const volverAModulos = () => {
  router.push('/');
};

const irA = (ruta: string) => {
  router.push(ruta);
};
</script>

<style lang="scss" scoped>
.header-toolbar {
  min-height: auto;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
}

.module-header-title {
  display: flex;
  align-items: center;
  font-size: 13px;
  letter-spacing: 0.5px;
  color: white;
  white-space: nowrap;
  flex-shrink: 0;

  span {
    font-weight: 700;
  }
}

.logo-header {
  height: 40px;
  width: auto;
  border-radius: 4px;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
}

.system-info {
  display: flex;
  flex-direction: column;
  justify-content: center;

  .system-name {
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 1px;
    color: white;
    line-height: 1;
  }

  .system-module {
    color: rgba(255, 255, 255, 0.8);
    font-weight: 500;
    font-size: 11px;
  }
}

.nav-tabs {
  display: flex;
  align-items: center;
  margin: 0 4px;
  flex-shrink: 0;

  :deep(.q-tabs) {
    min-height: auto;
  }

  :deep(.q-tab-panels) {
    display: none;
  }
}

.quick-actions {
  display: flex;
  gap: 8px;
  margin-left: 8px;

  :deep(.q-btn) {
    padding: 4px 12px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    border-radius: 4px;
    transition: all 0.2s ease;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }
  }
}
</style>
