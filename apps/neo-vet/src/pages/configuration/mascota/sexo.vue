<template>
  <baseCrud :modelName="modelName" :crudName="crudName" :tituloVentanaeliminacion="tituloVentanaeliminacion"/>
</template>

<script setup lang="ts" scoped>
import baseCrud from '../../../components/BaseCrud.vue';

const modelName: string = "sexo";
const crudName: string = "Sexo";
const tituloVentanaeliminacion: string = "Sexo";

</script>
