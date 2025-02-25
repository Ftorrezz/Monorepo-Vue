<template>
    <baseCrud :modelName="modelName" :crudName="crudName" :tituloVentanaeliminacion="tituloVentanaeliminacion"/>
  </template>

  <script setup lang="ts" scoped>
  import baseCrud from "../../components/BaseCrud.vue";

  const modelName: string = "tipositioubicacion";
  const crudName: string = "Tipo Sitio Ubicación";
  const tituloVentanaeliminacion: string = "del tipo de sitio ubicación";

  </script>
