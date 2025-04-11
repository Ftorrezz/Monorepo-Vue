<template>
  <baseCrud :modelName="modelName" :crudName="crudName" :tituloVentanaeliminacion="tituloVentanaeliminacion"/>
</template>

<script setup lang="ts" scoped>
import baseCrud from '../../../components/BaseCrud.vue';

const modelName: string = "caracter";
const crudName: string = "Carácter";
const tituloVentanaeliminacion: string = "Carácter";

</script>
