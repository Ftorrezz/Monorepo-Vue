<template>
  <baseCrud :modelName="modelName" :crudName="crudName" :tituloVentanaeliminacion="tituloVentanaeliminacion"/>
</template>

<script setup lang="ts" scoped>
import baseCrud from '../../../components/BaseCrud.vue';

const modelName: string = "ocupacion";
const crudName: string = "Ocupación";
const tituloVentanaeliminacion: string = "Ocupación";

</script>
