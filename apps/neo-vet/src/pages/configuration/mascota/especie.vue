<template>
  <baseCrud :modelName="modelName" :crudName="crudName" :tituloVentanaeliminacion="tituloVentanaeliminacion"/>
</template>

<script setup lang="ts" scoped>
import baseCrud from '../../../components/BaseCrud.vue';

const modelName: string = "especie";
const crudName: string = "Especie";
const tituloVentanaeliminacion: string = "Especie";

</script>
