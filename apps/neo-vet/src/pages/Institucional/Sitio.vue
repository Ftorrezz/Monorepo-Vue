<template>
    <baseCrud :modelName="modelName" :crudName="crudName" :tituloVentanaeliminacion="tituloVentanaeliminacion"/>
  </template>
  
  <script setup lang="ts" scoped>
  import baseCrud from "../../components/BaseCrud.vue";
  
  const modelName: string = "sitio";
  const crudName: string = "Sitio";
  const tituloVentanaeliminacion: string = "Sitio";
  
  </script>
  