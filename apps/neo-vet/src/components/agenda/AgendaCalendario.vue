<template>
    <div class="agenda-calendario">
      <div class="row q-mb-md">
        <div class="col-12 col-md-6">
          <q-card>
            <q-card-section>
              <div class="text-h6">Filtros de Agenda</div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="fechaInicio"
                    label="Fecha Inicio"
                    type="date"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="fechaFin"
                    label="Fecha Fin"
                    type="date"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-select
                    v-model="sucursalSeleccionada"
                    :options="sucursales"
                    label="Sucursal"
                    option-label="descripcion"
                    option-value="id"
                    outlined
                    dense
                    emit-value
                    map-options
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-select
                    v-model="servicioSeleccionado"
                    :options="servicios"
                    label="Servicio"
                    option-label="nombre"
                    option-value="id"
                    outlined
                    dense
                    emit-value
                    map-options
                    clearable
                  />
                </div>
              </div>
              <div class="row q-mt-md">
                <q-btn
                  color="primary"
                  label="Generar Agenda"
                  @click="cargarAgenda"
                  :loading="cargando"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
  
      <q-card v-if="agenda.length > 0">
        <q-card-section>
          <div class="text-h6">Agenda Disponible</div>
          <q-table
            :rows="agenda"
            :columns="columnas"
            row-key="id"
            :pagination="{ rowsPerPage: 20 }"
            :loading="cargando"
          >
            <template v-slot:body-cell-disponible="props">
              <q-td :props="props">
                <q-chip
                  :color="props.row.disponible ? 'green' : 'red'"
                  text-color="white"
                  :label="props.row.disponible ? 'Disponible' : 'Ocupado'"
                  dense
                />
              </q-td>
            </template>
            <template v-slot:body-cell-acciones="props">
              <q-td :props="props">
                <q-btn
                  v-if="props.row.disponible"
                  color="primary"
                  icon="event_available"
                  size="sm"
                  flat
                  dense
                  @click="reservarCita(props.row)"
                  :disable="!props.row.disponible"
                >
                  <q-tooltip>Reservar Cita</q-tooltip>
                </q-btn>
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import { date } from 'quasar';
  import agendaService from 'src/services/agendaService';
  import sucursalService from 'src/services/sucursalService';
  import servicioService from 'src/services/servicioService';
  import { useQuasar } from 'quasar';
  
  export default {
    name: 'AgendaCalendario',
    
    setup() {
      const $q = useQuasar();
      const idSitio = ref(1); // Obtener de tu sistema de autenticación
      
      // Estados
      const fechaInicio = ref(date.formatDate(new Date(), 'YYYY-MM-DD'));
      const fechaFin = ref(date.formatDate(date.addToDate(new Date(), { days: 7 }), 'YYYY-MM-DD'));
      const sucursalSeleccionada = ref(null);
      const servicioSeleccionado = ref(null);
      const sucursales = ref([]);
      const servicios = ref([]);
      const agenda = ref([]);
      const cargando = ref(false);
      
      // Columnas para la tabla
      const columnas = [
        { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left', sortable: true },
        { name: 'hora', label: 'Hora', field: 'hora', align: 'left', sortable: true },
        { name: 'nombre_servicio', label: 'Servicio', field: 'nombre_servicio', align: 'left', sortable: true },
        { name: 'disponible', label: 'Estado', field: 'disponible', align: 'center', sortable: true },
        { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' }
      ];
      
      // Cargar datos iniciales
      onMounted(async () => {
        try {
          // Cargar sucursales
          const respSucursales = await sucursalService.obtenerSucursales();
          sucursales.value = respSucursales.data;
          
          if (sucursales.value.length > 0) {
            sucursalSeleccionada.value = sucursales.value[0].id;
          }
          
          // Cargar servicios
          const respServicios = await servicioService.obtenerServicios(idSitio.value);
          servicios.value = respServicios.data;
        } catch (error) {
          mostrarError('Error al cargar datos iniciales', error);
        }
      });
      
      // Cargar agenda
      const cargarAgenda = async () => {
        if (!sucursalSeleccionada.value) {
          $q.notify({
            type: 'warning',
            message: 'Debe seleccionar una sucursal'
          });
          return;
        }
        
        cargando.value = true;
        
        try {
          const response = await agendaService.generarAgenda(
            fechaInicio.value,
            fechaFin.value,
            sucursalSeleccionada.value,
            idSitio.value,
            servicioSeleccionado.value
          );
          
          agenda.value = response.data;
          
          if (agenda.value.length === 0) {
            $q.notify({
              type: 'info',
              message: 'No hay horarios disponibles para los criterios seleccionados'
            });
          }
        } catch (error) {
          mostrarError('Error al generar agenda', error);
        } finally {
          cargando.value = false;
        }
      };
      
      // Reservar cita
      const reservarCita = (slot) => {
        // Aquí implementarías la lógica para reservar la cita
        // Podrías abrir un diálogo para confirmar la reserva
        $q.dialog({
          title: 'Confirmar Reserva',
          message: `¿Desea reservar una cita para el servicio ${slot.nombre_servicio} el día ${slot.fecha} a las ${slot.hora}?`,
          cancel: true,
          persistent: true
        }).onOk(() => {
          // Aquí llamarías a tu API para crear la cita
          $q.notify({
            type: 'positive',
            message: 'Cita reservada correctamente'
          });
        });
      };
      
      // Mostrar errores
      const mostrarError = (mensaje, error) => {
        console.error(error);
        $q.notify({
          type: 'negative',
          message: mensaje,
          caption: error.response?.data?.message || error.message || 'Error desconocido'
        });
      };
      
      return {
        fechaInicio,
        fechaFin,
        sucursalSeleccionada,
        servicioSeleccionado,
        sucursales,
        servicios,
        agenda,
        columnas,
        cargando,
        cargarAgenda,
        reservarCita
      };
    }
  };
  </script>