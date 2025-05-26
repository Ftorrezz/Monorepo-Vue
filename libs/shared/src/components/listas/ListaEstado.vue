<template>
  <ListaSelect
    v-model="modeloInterno"
    :endpoint="endpointComputed"
    label="Estado"
    :disable="!idPais"
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
  idPais: {
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

// Endpoint computado que incluye el idPais como parámetro de consulta
const endpointComputed = computed(() => {
  return 'estado'
  //return props.idPais ? `estado?id_pais=${props.idPais}` : undefined;
  // Si no hay idPais, se devuelve undefined para que ListaSelect no haga la petición,
  // o un endpoint que devuelva una lista vacía, dependiendo de cómo esté implementado ListaSelect.
  // Asumimos que ListaSelect maneja un endpoint undefined o vacío no haciendo la petición.
});
</script>
