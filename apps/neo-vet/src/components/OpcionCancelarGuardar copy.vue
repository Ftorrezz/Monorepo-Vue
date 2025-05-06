<template>
  <q-card-actions align="right" class="opciones-footer">
    <q-btn
      no-caps
      padding="xs lg"
      :color="colorGuardar"
      :label="textoGuardar"
      @click="accionValidar"
      :class="`shadow-${2}`"
      size="18px"
    >
      <q-tooltip>{{ tooltipGuardar }}</q-tooltip>
    </q-btn>
    <q-btn
      no-caps
      padding="xs lg"
      color="red-14"
      :label="textoCancelar"
      @click="accionCerrar"
    >
      <q-tooltip>{{ tooltipCancelar }}</q-tooltip>
    </q-btn>
  </q-card-actions>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  tipo: {
    type: String,
    default: 'propietario',
    validator: (value: string) => ['propietario', 'mascota'].includes(value)
  },
  textoGuardar: {
    type: String,
    default: 'Guardar'
  },
  textoCancelar: {
    type: String,
    default: 'Cancelar'
  },
  colorGuardar: {
    type: String,
    default: 'green-8'
  }
});

const emit = defineEmits(['accionCerrar', 'accionValidar']);

const tooltipGuardar = computed(() => {
  return props.tipo === 'propietario' 
    ? 'Guardar información del propietario' 
    : 'Guardar información de la mascota';
});

const tooltipCancelar = computed(() => {
  return `Cancelar el proceso de ${props.tipo === 'propietario' ? 'propietario' : 'mascota'}`;
});

const accionCerrar = () => {
  emit('accionCerrar');
};

const accionValidar = () => {
  emit('accionValidar');
};
</script>

<style scoped>
.opciones-footer {
  position: sticky;
  bottom: 0;
  background: white;
  padding: 16px;
  border-top: 1px solid #ddd;
  z-index: 1;
  margin-top: auto;
}

.q-btn {
  transition: all 0.3s ease;
}

.q-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}
</style>
