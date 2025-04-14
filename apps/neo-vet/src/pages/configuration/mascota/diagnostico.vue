<template>
  <baseCrud :modelName="modelName" :crudName="crudName" :tituloVentanaeliminacion="tituloVentanaeliminacion"/>
</template>

<script setup lang="ts" scoped>
import baseCrud from '../../../components/BaseCrud.vue';

const modelName: string = "diagnostico";
const crudName: string = "Diagnostico";
const tituloVentanaeliminacion: string = "del Diagnostico";

</script>
