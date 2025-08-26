<template>
    <baseCrud :modelName="modelName" :crudName="crudName" :tituloVentanaeliminacion="tituloVentanaeliminacion"/>
  </template>

  <script setup lang="ts" scoped>
  import baseCrud from "../../components/BaseCrud.vue";

  const modelName: string = "sitioubicacion";
  const crudName: string = "Sitio Ubicación";
  const tituloVentanaeliminacion: string = "del sitio ubicación";

  </script>
