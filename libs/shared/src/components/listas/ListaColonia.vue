<template>
  <ListaSelect
    v-model="modeloInterno"
    :endpoint="endpointComputed"
    label="Colonia"
    :disable="!idMunicipio"
    v-bind="$attrs"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ListaSelect from "../ListaSelect.vue"; // Asegúrate que la ruta sea correcta

const props = defineProps({
  modelValue: {
    type: [Number, null],
    default: null,
  },
  idMunicipio: {
    type: [Number, null],
    default: null,
  },
  // Las 'rules' y otros atributos se pasarán a ListaSelect mediante v-bind="$attrs"
});

const emit = defineEmits(['update:modelValue']);

// Modelo interno para v-model bidireccional
const modeloInterno = computed({
  get: () => (props.modelValue === null ? undefined : props.modelValue),
  set: (value) => {
    emit("update:modelValue", value === undefined ? null : value);
  },
});

// Endpoint computado que incluye el idMunicipio como parámetro de consulta
const endpointComputed = computed(() => {
  return 'colonia'
  //return props.idMunicipio ? `colonia?id_municipio=${props.idMunicipio}` : undefined;
  // Si no hay idMunicipio, se devuelve undefined.
  // ListaSelect debe manejar un endpoint undefined no haciendo la petición.
});
</script>
