<template>
    <q-page padding>
      <div class="text-h4 q-mb-md">Agenda de Servicios</div>
      <agenda-calendario />
    </q-page>
  </template>
  
  <script>
  import AgendaCalendario from 'components/AgendaCalendario.vue';
  
  export default {
    name: 'AgendaPage',
    components: {
      AgendaCalendario
    }
  };
  </script>