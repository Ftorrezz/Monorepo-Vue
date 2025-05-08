<template>
  <div>
    <div class="text-h5 q-mb-md text-teal">Propietario</div>
    <q-separator class="q-mb-md" color="grey-3" style="height: 2px" />

    <q-tabs
      v-model="tabPropietario"
      dense
      class="text-grey q-mb-lg"
      active-color="primary"
      indicator-color="primary"
      align="justify"
    >
      <q-tab name="general" label="General" />
      <q-tab name="adicional" label="Adicional" />
      <q-tab name="facturacion" label="Facturación" />
    </q-tabs>

    <q-tab-panels v-model="tabPropietario" animated class="flex-panels">
      // ... existing code ...
    </q-tab-panels>
  </div>
</template>

<script setup lang="ts">
import { usePropietario } from '@/composables/usePropietario';

const { 
  tabPropietario, 
  formData, 
  imagenCapturada,
  camaraActiva,
  activarCamara,
  capturarFoto,
  detenerCamara,
  reiniciarCamara,
  isValidEmail
} = usePropietario();

defineEmits(['propietario-guardado']);
</script>