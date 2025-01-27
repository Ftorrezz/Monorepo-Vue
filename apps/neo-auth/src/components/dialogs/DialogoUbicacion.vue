<template>
  <q-dialog v-model="dialogStore.showSucursalDialog" persistent>
    <q-card style="width: 600px; max-width: 90vw; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
      <q-card-section>
        <div class="text-h5 font-bold text-primary">Sucursales</div>
        <div class="text-subtitle2 text-dark q-mt-sm">
          Por favor, seleccione la sucursal a la que desea ingresar.
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-list>
          <q-item
            v-for="sucursal in dialogStore.sucursales"
            :key="sucursal.id"
            class="custom-card q-mb-md"
            @click="selectBranch(sucursal)"
            clickable
          >

            <q-item-section avatar>
              <q-img
                :src="sucursal.imagen"
                alt="Imagen de sucursal"
                style="width: 120px; height: 100px; object-fit: cover; border-radius: 8px"
              />
            </q-item-section>

            <q-item-section class="q-pl-md">
              <div class="text-h6 font-medium text-primary text-white">{{ sucursal.descripcion }}</div>
              <div class="text-subtitle2 text-grey-5 q-mt-xs">{{ sucursal.direccion }}</div>
              <div class="text-caption text-grey q-mt-xs">{{ sucursal.responsable }}</div>
            </q-item-section>

            <!--<q-item-section side>
              <q-btn
                round
                icon="check"
                color="positive"
                class="elevated-btn"
                @click="selectBranch(sucursal)"
              >
              <q-tooltip>Ingresar</q-tooltip>
              </q-btn>
            </q-item-section>-->
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancelar ingreso" color="negative" v-close-popup @click="dialogStore.closeDialog">
          <q-tooltip>Cancelar el proceso de selección</q-tooltip>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";

import { useDialogStore } from "../../stores/DialogoUbicacion";
import { Sucursal } from "../../../../../libs/shared/src/interfaces/sucursal.interfaz";

const dialogStore = useDialogStore();

// Función para manejar la selección de una sucursal
const selectBranch = (sucursal: Sucursal) => {
  dialogStore.selectBranch(sucursal);
};
</script>

<style lang="scss" scoped>
.custom-card {
  background: linear-gradient(145deg, #5930d2, #3329f6);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0px 4px 8px rgba(14, 22, 243, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.custom-card:hover {
  transform: scale(1.05);
  box-shadow: 0px 6px 15px rgba(0, 0, 0, 0.2);
}

.elevated-btn {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.elevated-btn:hover {
  transform: scale(1.1);
}

.text-primary {
  color: #e9ecf0;
}

.text-grey-7 {
  color: #6c757d;
}

.text-grey {
  color: #adb5bd;
}
</style>
