<template>
  <q-card-actions align="right">
    <q-btn

      no-caps
      padding="xs lg"
      color="green-8"
      label="Guardar"
      @click="accionValidar"
      :class="`shadow-${2}`"
      size="18px"
    >
    <q-tooltip>Guardar información</q-tooltip>
    </q-btn>
    <q-btn

      no-caps
      padding="xs lg"
      color="red-14"
      label="Cancelar"
      @click="accionCerrar"
    >
    <q-tooltip>Cancelar el proceso</q-tooltip>
    </q-btn>
  </q-card-actions>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  setup(props, context) {
    const accionCerrar = () => {
      context.emit("accionCerrar");
    };
    const accionValidar = () => {
      context.emit("accionValidar");
    };

    return { accionCerrar, accionValidar };
  },
});
</script>
