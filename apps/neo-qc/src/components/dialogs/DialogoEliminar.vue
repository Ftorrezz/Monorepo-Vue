<template>
  <q-dialog>
    <q-card>
      <q-card-section>
        <!--<div class="text-h6">
          ¿ Confirma la eliminación {{ tituloVentanaeliminacion }} ?
        </div>-->
      </q-card-section>
      <q-card-actions align="center">
        <q-btn
          outline
          no-caps
          padding="xs lg"
          color="positive"
          label="Aceptar"
          @click="deleteItemConfirm"
        >
           
        </q-btn>
        <q-btn
          outline
          no-caps
          padding="xs lg"
          color="red-14"
          label="Cancelar"
          @click="closeDelete"
        >
        
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import PeticionService from '../../services/peticion.service'

export default defineComponent({
  props: ["tituloVentanaeliminacion"],

  setup(props, context) {
    const closeDelete = () => {
      context.emit("closeDelete");
    };
    const deleteItemConfirm = () => {
      
      /*console.log('le dio eliminar')
      const peticionService = new PeticionService();
      let model: string;
      peticionService.eliminar(model, true)*/
      context.emit("deleteItemConfirm");
    };

    return { closeDelete, deleteItemConfirm };
  },
});
</script>
