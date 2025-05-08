<template>
  <q-dialog v-model="mostrarDialogo" persistent>
    <q-card bordered elevated class="dialog-card">
      <q-bar class="bg-primary text-white">
        <q-icon name="person" />
        <div>Propietario / Mascota</div>
        <q-space />
        <q-btn dense flat icon="close" v-close-popup>
          <q-tooltip>Cerrar</q-tooltip>
        </q-btn>
      </q-bar>

      <q-card-section class="fixed-height-section">
        <q-card elevated>
          <q-splitter v-model="splitterModel" style="height: calc(600px - 50px)">
            <template v-slot:before>
              <q-tabs v-model="tab" vertical class="text-teal">
                <q-tab name="propietario" icon="person" label="Propietario" />
                <q-tab name="mascota" icon="pets" label="Mascota" />
              </q-tabs>
            </template>

            <template v-slot:after>
              <q-tab-panels v-model="tab" animated swipeable vertical>
                <q-tab-panel name="propietario">
                  <DialogPropietario @propietario-guardado="onPropietarioGuardado" />
                </q-tab-panel>

                <q-tab-panel name="mascota">
                  <DialogMascota
                    :propietario-id="propietarioActual.id"
                    :propietario-nombre="propietarioActual.nombre"
                    @mascota-guardada="onMascotaGuardada"
                  />
                </q-tab-panel>
              </q-tab-panels>
            </template>
          </q-splitter>
        </q-card>
      </q-card-section>

      <q-card-section class="q-pa-md">
        <OpcionCancelarGuardar @accionCerrar="close" @accionValidar="validate" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import DialogPropietario from './DialogPropietario.vue';
import DialogMascota from './DialogMascota.vue';
import OpcionCancelarGuardar from '../OpcionCancelarGuardar.vue';

const tab = ref('propietario');
const splitterModel = ref(10);
const mostrarDialogo = ref(true);
const propietarioActual = ref({ id: 0, nombre: '' });

const onPropietarioGuardado = (propietario) => {
  propietarioActual.value = propietario;
  tab.value = 'mascota';
};

const onMascotaGuardada = (mascota) => {
  // Manejar la mascota guardada
  mostrarDialogo.value = false;
};

const validate = async () => {
  if (tab.value === 'propietario') {
    // Validar y guardar propietario
  } else {
    // Validar y guardar mascota
  }
};

const close = () => {
  mostrarDialogo.value = false;
};
</script>

<style scoped>
.camera-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin: 0;
}

.photo-container {
  width: 130px;
  height: 130px;
  border: 3px dashed #ccc;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
  cursor: pointer;
  position: relative;
}

.camera-preview, .captured-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.camera-controls {
  margin-top: 0.5rem;
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

/* Ajustes responsive */
@media (max-width: 600px) {
  .photo-container {
    width: 120px;
    height: 120px;
  }
}
.dialog-card {
  width: 90vw;
  max-width: 1200px;
  min-width: 320px;
  border-radius: 10px;
  overflow: hidden;
}

.fixed-height-section {
  height: 650px;
  overflow: hidden;
}

.fixed-height-panel {
  height: 100%;
  overflow-y: auto;
}

/* Estilo para mantener consistente el tamaño de los paneles */
:deep(.q-tab-panel) {
  padding: 8px !important;
}

.q-pa-none {
  padding: 0 !important;
}

.row.q-col-gutter-md {
  margin: 0;
}

.row.q-col-gutter-sm {
  margin: 0;
}

/* Ajuste específico para la sección de la cámara */
.camera-section {
  margin-top: 0;
  padding-top: 0;
}

.q-item {
  padding-top: 0;
  padding-bottom: 8px;
}
</style>



