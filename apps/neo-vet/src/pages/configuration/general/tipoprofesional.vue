<template>
  <baseCrud :modelName="modelName" :crudName="crudName" :tituloVentanaeliminacion="tituloVentanaeliminacion"/>
</template>

<script setup lang="ts" scoped>
import baseCrud from '../../../components/BaseCrud.vue';

const modelName: string = "tipoprofesional";
const crudName: string = "TipoProfesional";
const tituloVentanaeliminacion: string = "Tipo Profesional";

</script>
