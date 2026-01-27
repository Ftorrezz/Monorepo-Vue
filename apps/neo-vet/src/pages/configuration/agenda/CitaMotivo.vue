<template>
  <baseCrud :modelName="modelName" :crudName="crudName" :tituloVentanaeliminacion="tituloVentanaeliminacion"/>
</template>

<script setup lang="ts" scoped>
import baseCrud from '../../../components/BaseCrud.vue';

const modelName: string = "citamotivo";
const crudName: string = "Motivo de Cita";
const tituloVentanaeliminacion: string = "Motivo de Cita";

</script>