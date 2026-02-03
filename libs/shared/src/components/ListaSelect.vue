<template>
  <q-select
    v-model="modeloInterno"
    :options="opciones"
    :label="label"
    :loading="cargando"
    :error="!!error"
    :error-message="error ? 'Error al cargar datos' : ''"
    v-bind="$attrs"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template v-for="(_, name) in $slots" #[name]="slotData" :key="name">
      <slot :name="name" v-bind="slotData || {}" />
    </template>
  </q-select>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import useListas from "../composables/useListas";

const props = defineProps({
  modelValue: {
    type: [String, Number, Object, Array],
    default: null
  },
  endpoint: {
    type: String,
    default: undefined
    //required: true
  },
  label: {
    type: String,
    default: "Seleccione"
  },
  valueField: {
    type: String,
    default: "id"
  },
  labelField: {
    type: String,
    default: "descripcion"
  },
  filtro: {
    type: Object,
    default: null
  },
  cargarAlIniciar: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(["update:modelValue"]);

const { obtenerLista } = useListas();

// Obtener la lista usando el composable
const { lista, cargando, error, cargarDatos } = obtenerLista(
  props.endpoint,
  {
    valueField: props.valueField,
    labelField: props.labelField,
    filtro: props.filtro,
    cargarAlIniciar: props.cargarAlIniciar
  }
);

// Modelo interno para v-model bidireccional
const modeloInterno = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value)
});

// Exponer opciones y métodos para el componente padre
const opciones = computed(() => lista.value);

// Exponer método para recargar datos
defineExpose({
  cargarDatos,
  opciones
});
</script>