<template>
    <baseCrud :modelName="modelName" :crudName="crudName" :tituloVentanaeliminacion="tituloVentanaeliminacion"/>
  </template>
  
  <script setup lang="ts" scoped>
  import baseCrud from "../../components/BaseCrud.vue";
  
  const modelName: string = "sucursal";
  const crudName: string = "Sucursal";
  const tituloVentanaeliminacion: string = "Sucursal";
  
  </script>
  