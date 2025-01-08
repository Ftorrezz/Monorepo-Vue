<template>
  <div class="q-pa-md">
    <q-layout view="hHh Lpr lFf">
      <q-header flat class="bg-primary">
        <q-toolbar>
          <q-btn
            flat
            dense
            round
            @click="toggleLeftDrawer"
            icon="menu"
            aria-label="Menu"
          />
          NeoHIS

          <q-toolbar-title>

          </q-toolbar-title>

          <DarkModeToggle />
          <MenuOpcionesUsuario />

        </q-toolbar>
      </q-header>

      <q-drawer
        v-model="leftDrawerOpen"
        show-if-above
        :width="360"
        :breakpoint="400"
        elevated
        side="left"
        :mini="miniState"
        @mouseover="miniState = false"
        @mouseout="miniState = true"
      >
        <div
          class="full-height"
          :class="$q.dark.isActive ? 'drawer_dark' : 'drawer_normal'"
        >
          <div style="height: calc(100% - 20px); padding: 5px">
            <q-scroll-area style="height: 100%">
              <MenuPrincipal />

            </q-scroll-area>
          </div>
        </div>
      </q-drawer>

      <q-page-container>

        <router-view />

      </q-page-container>

      <q-footer elevated borderead class="bg-primary">
      <q-toolbar>
        <q-toolbar-title>

          <div>Ubicación</div>
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>

    </q-layout>
  </div>
</template>

<script setup lang="ts">
import DarkModeToggle from "src/components/DarkModeToggle.vue"; //"components/DarkModeToggle.vue";
import MenuPrincipal from "../components/MenuPrincipalHospital.vue";
import MenuOpcionesUsuario from "src/components/MenuOpcionesUsuario.vue"
import useAuth from "src/composables/useAuth";
import { ref } from "vue";
import { useRouter } from "vue-router";

defineOptions({
  name: 'HISLayout'
});

  const router = useRouter();

  const leftDrawerOpen = ref(false);

  function toggleLeftDrawer () {
    leftDrawerOpen.value = !leftDrawerOpen.value;
  };

  const miniState =  ref(true);

  const drawer = ref(false);

</script>
