<template>
  <baseCrud :modelName="modelName" :crudName="crudName" :tituloVentanaeliminacion="tituloVentanaeliminacion"/>
</template>

<script setup lang="ts" scoped>
import baseCrud from '../../../components/BaseCrud.vue';

const modelName: string = "escolaridad";
const crudName: string = "Escolaridad";
const tituloVentanaeliminacion: string = "Escolaridad";

</script>
