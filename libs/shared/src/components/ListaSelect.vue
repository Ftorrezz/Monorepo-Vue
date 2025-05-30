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
    <template v-for="(_, name) in $slots" #[name]="slotData">
      <slot :name="name" v-bind="slotData" />
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
const loading = ref(false);

const fetchData = async () => {
  if (!props.endpoint) { // Si no hay endpoint, no hacer nada o resetear
    opciones.value = [];
    // Aquí también podrías resetear el v-model interno si es necesario
    // emit('update:modelValue', null); // o undefined
    return;
  }
  loading.value = true;
  try {
    // Lógica para llamar a tu API con props.endpoint
    // const response = await api.get(props.endpoint);
    // opciones.value = response.data;
    console.log(`ListaSelect: Fetching data from ${props.endpoint}`); // Para depuración
  } catch (error) {
    console.error("Error fetching data in ListaSelect:", error);
    opciones.value = []; // Resetear en caso de error
  } finally {
    loading.value = false;
  }
};

// Observar cambios en el endpoint para recargar datos
watch(() => props.endpoint, (newEndpoint, oldEndpoint) => {
  // Solo recargar si el nuevo endpoint es diferente y no es la carga inicial (manejada por onMounted si se prefiere)
  // o si queremos que siempre recargue cuando el endpoint cambie (incluso de undefined a una url)
  fetchData();
}, { immediate: false }); // `immediate: false` para que no se ejecute al montar si ya lo hace onMounted

onMounted(() => {
  // Cargar datos al montar solo si el endpoint ya está definido
  if (props.endpoint) {
    fetchData();
  }
});

// Exponer método para recargar datos
defineExpose({
  cargarDatos,
  opciones
});
</script>