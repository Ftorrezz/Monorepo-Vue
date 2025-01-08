<template>
  <div class="q-pa-md">
    <q-layout view="hHh Lpr lFf">
      <q-header flat class="bg-primary">
        <q-toolbar>
          <q-toolbar-title>
            NeoHIS
          </q-toolbar-title>

          <DarkModeToggle />
          <MenuOpcionesUsuario />

          
        </q-toolbar>
      </q-header>

      <q-page-container>
        <router-view />
      </q-page-container>
    </q-layout>
  </div>
</template>

<script setup lang="ts">
import DarkModeToggle from "components/DarkModeToggle.vue";
import MenuOpcionesUsuario from '../components/MenuOpcionesUsuario.vue';

defineOptions({
  name: 'InicioLayout'
});

</script>
