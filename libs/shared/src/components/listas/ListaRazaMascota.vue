<template>
  <ListaSelect
    v-model="modeloInterno"
    endpoint="razamascota"
    label="Raza"
    v-bind="$attrs"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script setup>
import { computed } from "vue";
import ListaSelect from "../ListaSelect.vue";

const props = defineProps({
  modelValue: {
    type: [String, Number, Object],
    default: null
  }
});

const emit = defineEmits(["update:modelValue"]);

// Modelo interno para v-model bidireccional
const modeloInterno = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value)
});
</script>