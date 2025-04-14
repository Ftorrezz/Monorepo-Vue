<template>
  <baseCrud :modelName="modelName" :crudName="crudName" :tituloVentanaeliminacion="tituloVentanaeliminacion"/>
</template>

<script setup lang="ts" scoped>
import baseCrud from '../../../components/BaseCrud.vue';

const modelName: string = "especialidad";
const crudName: string = "Especialidad";
const tituloVentanaeliminacion: string = "de la especialidad";

</script>
