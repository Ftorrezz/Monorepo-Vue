<template>
  <ListaSelect
    v-model="modeloInterno"
    endpoint="pais" 
    label="País"
    v-bind="$attrs"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ListaSelect from "../ListaSelect.vue";

const props = defineProps({
  modelValue: {
    type: [Number, null],
    default: null,
  },
  // Las 'rules' y otros atributos se pasarán a ListaSelect mediante v-bind="$attrs"
});

const emit = defineEmits(['update:modelValue']);

// Modelo interno para v-model bidireccional, igual que en ListaGenero
const modeloInterno = computed({
  get: () => (props.modelValue === null ? undefined : props.modelValue),
  set: (value) => {
    // Si ListaSelect emite undefined (ej. al limpiar el campo),
    // nosotros queremos propagar null al componente padre para mantener
    // la consistencia del tipo `number | null`.
    emit("update:modelValue", value === undefined ? null : value);
  },
});
</script>
