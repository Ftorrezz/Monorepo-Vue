<template>
  <baseCrud :modelName="modelName" :crudName="crudName" :tituloVentanaeliminacion="tituloVentanaeliminacion"/>
</template>

<script setup lang="ts" scoped>
import baseCrud from '../../../components/BaseCrud.vue';

const modelName: string = "generoconfiguracion";
const crudName: string = "Genero";
const tituloVentanaeliminacion: string = "Genero";

</script>
