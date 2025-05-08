<template>
  <div>
    <div class="text-h5 q-mb-md text-teal">Mascota</div>
    <q-separator class="q-mb-md" color="grey-3" style="height: 2px" />

    <q-tabs
      v-model="tabMascota"
      dense
      class="text-grey q-mb-lg"
      active-color="primary"
      indicator-color="primary"
      align="justify"
    >
      <q-tab name="general" label="General" />
      <q-tab name="adicional" label="Adicional" />
    </q-tabs>

    <q-tab-panels v-model="tabMascota" animated class="flex-panels">
      // ... existing code ...
    </q-tab-panels>
  </div>
</template>

<script setup lang="ts">
import { useMascota } from '@/composables/useMascota';

const props = defineProps<{
  propietarioId: number;
  propietarioNombre: string;
}>();

const {
  tabMascota,
  formData,
  imagenCapturada,
  camaraActiva,
  activarCamara,
  capturarFoto,
  detenerCamara,
  reiniciarCamara
} = useMascota(props.propietarioId);

defineEmits(['mascota-guardada']);
</script>