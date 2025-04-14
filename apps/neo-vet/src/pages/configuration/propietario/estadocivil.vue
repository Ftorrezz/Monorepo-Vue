<template>
  <baseCrud :modelName="modelName" :crudName="crudName" :tituloVentanaeliminacion="tituloVentanaeliminacion"/>
</template>

<script setup lang="ts" scoped>
import baseCrud from '../../../components/BaseCrud.vue';

const modelName: string = "estadocivil";
const crudName: string = "Estado Civil";
const tituloVentanaeliminacion: string = "Estado Civil";

</script>
