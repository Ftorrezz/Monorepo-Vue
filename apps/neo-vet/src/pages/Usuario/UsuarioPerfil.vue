<template>
  <baseCrud :modelName="modelName" :crudName="crudName" :tituloVentanaeliminacion="tituloVentanaeliminacion"/>
</template>

<script setup lang="ts" scoped>
import baseCrud from "../../components/BaseCrud.vue";

const modelName: string = "perfilconfiguracion";
const crudName: string = "Perfil de usuario";
const tituloVentanaeliminacion: string = "Perfil";

</script>
