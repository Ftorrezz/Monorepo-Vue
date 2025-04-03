<template>
   <q-dialog v-model="mostrarDialogo" persistent full-width>
    
    <q-card>
        <q-bar>
          <q-icon name="person" />
          <div>Propietario</div>

          <q-space />

          <q-btn dense flat icon="close" v-close-popup>
            <q-tooltip>Cerrar</q-tooltip>
          </q-btn>
        </q-bar>

        
        
        
        
        
        
      </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";

const mostrarDialogo = ref(true);

</script>
