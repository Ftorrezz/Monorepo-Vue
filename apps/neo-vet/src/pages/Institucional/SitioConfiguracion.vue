<template>
    <baseCrud :modelName="modelName" :crudName="crudName" :tituloVentanaeliminacion="tituloVentanaeliminacion"/>
  </template>

  <script setup lang="ts" scoped>
  import baseCrud from "../../components/BaseCrud.vue";

  const modelName: string = "configuracion";
  const crudName: string = "Sitio Configuración";
  const tituloVentanaeliminacion: string = "de la configuración del sitio";

  </script>
