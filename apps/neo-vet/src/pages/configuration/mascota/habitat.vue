<template>
  <baseCrud :modelName="modelName" :crudName="crudName" :tituloVentanaeliminacion="tituloVentanaeliminacion"/>
</template>

<script setup lang="ts" scoped>
import baseCrud from '../../../components/BaseCrud.vue';

const modelName: string = "habitat";
const crudName: string = "Habitat";
const tituloVentanaeliminacion: string = "Habitat";

</script>
