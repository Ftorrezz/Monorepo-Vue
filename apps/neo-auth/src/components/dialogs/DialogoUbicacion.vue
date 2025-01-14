<template>
  <q-dialog v-model="showDialog">
    <q-card style="width: 800px; max-width: 90vw; ">
      <q-card-section>
        <div class="text-h6">Selecciona una sucursal {{ nombreUsuario }}</div>
        <div class="text-subtitle2 q-mt-sm">
          Por favor, elige la sucursal en la que vas a trabajar.
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-list>
          <q-item 
            v-for="branch in branches" 
            :key="branch.id" 
            class="custom-card q-mb-md"
          >
            <q-item-section avatar>
              <q-img
                :src="branch.image"
                alt="Imagen de sucursal"
                style="width: 120px; height: 100px; object-fit: cover; border-radius: 8px"
              />
            </q-item-section>

            <q-item-section class="q-pl-md">
              <div class="text-h6 text-primary">{{ branch.name }}</div>
              <div class="text-subtitle2 text-grey-8">{{ branch.address }}</div>
              <div class="text-caption text-grey">{{ branch.manager }}</div>
            </q-item-section>

            <q-item-section side>
              <q-btn
                round 
                icon="check"
                color="primary"
                
                @click="selectBranch(branch)"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cerrar" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
  nombreUsuario: string;
}>();

// Estado para controlar el diálogo
const showDialog = ref(true);

// Lista de sucursales (esta vendría del backend)
const branches = ref([
  {
    id: 1,
    name: "Sucursal Centro",
    address: "Av. Principal 123, Ciudad",
    manager: "Juan Pérez",
    image: "https://cdn.quasar.dev/img/boy-avatar.png"
  },
  {
    id: 2,
    name: "Sucursal Norte",
    address: "Calle Norte 456, Ciudad",
    manager: "María López",
    image: "https://cdn.quasar.dev/img/boy-avatar.png"
  },
  {
    id: 3,
    name: "Sucursal Sur",
    address: "Boulevard Sur 789, Ciudad",
    manager: "Carlos García",
    image: "https://cdn.quasar.dev/img/boy-avatar.png"
  }
]);

// Función para manejar la selección de una sucursal
const selectBranch = (branch: { id: number; name: string; address: string; manager: string; image: string }) => {
  console.log("Sucursal seleccionada:", branch);
  // Aquí puedes guardar la sucursal seleccionada y cerrar el diálogo
  showDialog.value = false;
};
</script>

<style lang="scss" scoped>
/* Fondo ligeramente gris */
.custom-card {
  background: #cfcdef;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0px 2px 8px rgba(245, 6, 6, 0.2);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

/* Efecto al pasar el mouse */
.custom-card:hover {
  transform: scale(1.03); /* Agranda un poco la tarjeta */
  box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.2);
}

/* Colores principales */
.text-primary {
  color: #007bff; /* Azul primario */
}

.text-grey-8 {
  color: #6c757d; /* Gris suave */
}
</style>
