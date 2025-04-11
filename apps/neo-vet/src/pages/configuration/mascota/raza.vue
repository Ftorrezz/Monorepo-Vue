<template>
  <baseCrud :modelName="modelName" :crudName="crudName" :tituloVentanaeliminacion="tituloVentanaeliminacion"/>
</template>

<script setup lang="ts" scoped>
import baseCrud from '../../../components/BaseCrud.vue';

const modelName: string = "razamascota";
const crudName: string = "Raza";
const tituloVentanaeliminacion: string = "Raza";

</script>
