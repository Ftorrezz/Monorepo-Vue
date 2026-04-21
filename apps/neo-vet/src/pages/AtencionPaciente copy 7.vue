<template>
  <div class="fullscreen-atencion">
    <div class="app-shell" :class="{ 'is-collapsed': sidebarCollapsed }">
      <!-- SIDEBAR LATERAL SEGUIMIENTO -->
      <aside class="atencion-sidebar">
        <div class="sidebar-header q-pa-md flex items-center justify-between">
          <div class="logo-area flex items-center" v-if="!sidebarCollapsed">
            <q-icon name="health_and_safety" color="primary" size="24px" class="q-mr-sm" />
            <div class="text-subtitle1 text-weight-bolder text-primary">VET-CORE</div>
          </div>
          <q-btn
            flat round dense
            :icon="sidebarCollapsed ? 'last_page' : 'first_page'"
            color="grey-7"
            @click="sidebarCollapsed = !sidebarCollapsed"
          />
        </div>

        <div class="sidebar-main scroll">
          <!-- Mini Profile Paciente -->
          <div class="patient-sidebar-profile q-ma-md" v-if="!sidebarCollapsed">
            <div class="flex items-center no-wrap">
              <q-avatar size="42px" class="bg-primary-soft text-primary text-weight-bold br-md shadow-1">
                {{ paciente?.nombre?.[0] || '?' }}
              </q-avatar>
              <div class="q-ml-sm overflow-hidden">
                <div class="text-weight-bold text-dark truncate">{{ paciente?.nombre || '...' }}</div>
                <div class="text-caption text-grey-6 truncate">{{ paciente?.especie || '...' }}</div>
              </div>
            </div>
          </div>

          <!-- Navegación de Servicios Activos -->
          <q-list class="q-px-sm" padding>
            <q-item-label header v-if="!sidebarCollapsed" class="text-uppercase text-weight-bold text-caption text-grey-5 letter-spacing-1">Servicios de Atención</q-item-label>
            
            <q-item
              clickable v-ripple
              :active="servicioActivoTab === 'resumen'"
              @click="servicioActivoTab = 'resumen'"
              active-class="nav-active"
              class="nav-btn br-md q-mb-xs"
            >
              <q-item-section avatar>
                <q-icon name="grid_view" />
              </q-item-section>
              <q-item-section v-if="!sidebarCollapsed">Resumen Clínico</q-item-section>
              <q-tooltip v-if="sidebarCollapsed" anchor="center right" self="center left">Resumen</q-tooltip>
            </q-item>

            <q-item
              v-for="servicio in serviciosAplicados"
              :key="'sidebar-nav-' + servicio.id"
              clickable v-ripple
              :active="servicioActivoTab === servicio.id"
              @click="servicioActivoTab = servicio.id"
              active-class="nav-active"
              class="nav-btn br-md q-mb-xs"
            >
              <q-item-section avatar>
                <q-icon :name="servicio.icono" />
              </q-item-section>
              <q-item-section v-if="!sidebarCollapsed">
                <q-item-label class="text-weight-medium">{{ servicio.nombre }}</q-item-label>
              </q-item-section>
              <q-item-section side v-if="servicio.completado && !sidebarCollapsed">
                <q-icon name="verified" color="positive" size="16px" />
              </q-item-section>
              <q-tooltip v-if="sidebarCollapsed" anchor="center right" self="center left">{{ servicio.nombre }}</q-tooltip>
            </q-item>

            <!-- Boton Añadir -->
            <q-item clickable v-ripple class="nav-btn-add br-md q-mt-md" @click="showAddServiceDialog = true" key="add-service-btn">
              <q-item-section avatar>
                <q-icon name="add_circle" color="primary" />
              </q-item-section>
              <q-item-section v-if="!sidebarCollapsed" class="text-primary text-weight-bold">Agregar Servicio</q-item-section>
            </q-item>
          </q-list>

          <!-- Timeline de Historial Contextual -->
          <div class="history-context-section q-mt-xl" v-if="!sidebarCollapsed && atenciones.length > 1" key="history-section">
            <q-item-label header class="text-uppercase text-weight-bold text-caption text-grey-5 letter-spacing-1">Historial Reciente</q-item-label>
            <q-list dense>
              <q-item 
                v-for="(atenc, idx) in atenciones.slice(0, 5)" 
                :key="'hist-' + atenc.id" 
                clickable v-ripple
                @click="atencionActual = idx"
                :active="atencionActual === idx"
                class="br-md q-mx-sm history-mini-item"
              >
                <q-item-section>
                  <q-item-label class="text-weight-bold text-caption">{{ atenc.numero }}</q-item-label>
                  <q-item-label caption>{{ atenc.fecha }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </div>

        <div class="sidebar-actions q-pa-md" v-if="!sidebarCollapsed">
          <q-btn outline color="primary" icon="history" label="Ver Historial" class="full-width br-lg q-mb-sm" @click="verDetallesAtencion" />
          <q-btn unelevated color="primary" icon="save" label="Guardar Atención" class="full-width br-lg" :loading="guardandoAtencion" @click="guardarAtencion" />
        </div>
      </aside>

      <!-- MAIN WORKSPACE -->
      <main class="main-workspace flex column">
        <!-- Header Compacto -->
        <header class="workspace-header q-px-lg q-py-sm bg-white border-bottom shadow-1">
          <div class="row items-center no-wrap">
            <div class="col-grow row items-center no-wrap">
              <div class="header-id-badge bg-grey-2 q-px-md q-py-xs br-pill text-weight-bold text-grey-8">
                <q-icon name="assignment" class="q-mr-sm" size="14px" /> {{ atencionActualData?.numero || 'S-ID' }}
              </div>
              <div class="q-ml-md">
                <q-badge :color="atencionActualData?.estado === 'Finalizada' ? 'positive' : 'blue-10'" class="q-px-sm br-md">
                   {{ atencionActualData?.estado || 'En curso' }}
                </q-badge>
              </div>
              <div class="q-ml-lg header-patient-name text-h6 text-weight-bold truncate" v-if="paciente">
                {{ paciente.nombre }}
              </div>
            </div>
            
            <div class="col-auto flex items-center gap-md">
               <div class="text-caption text-grey-6 hide-mobile">
                {{ atencionActualData?.veterinario }} | {{ atencionActualData?.fecha }}
              </div>
              <q-btn-group unelevated class="br-lg">
                <q-btn color="primary" icon="add" label="Nueva" @click="nuevaAtencion" class="q-px-md" />
                <q-btn color="white" text-color="primary" icon="search" @click="showSearchDialog = true" />
              </q-btn-group>
              <q-btn flat round icon="more_vert" color="grey-7" />
            </div>
          </div>
        </header>

        <!-- Viewport de Contenido -->
        <div class="workspace-viewport col scroll bg-grey-1" :key="'viewport-' + atencionActualData.id">
          <!-- Empty States -->
          <div v-if="atenciones.length === 0" class="full-height flex flex-center" key="empty-state">
             <div class="text-center animate-fade-in" v-if="!paciente">
                <q-icon name="manage_search" size="80px" color="grey-3" />
                <div class="text-h6 text-grey-5 q-mt-md">Selecciona un paciente para continuar</div>
                <q-btn unelevated color="primary" label="Buscador" class="q-mt-lg br-lg" icon="search" @click="showSearchDialog = true" />
             </div>
             <div class="text-center animate-fade-in" v-else>
                <q-icon name="post_add" size="80px" color="blue-1" />
                <div class="text-h6 text-grey-7 q-mt-md">No hay atenciones para {{ paciente.nombre }}</div>
                <q-btn unelevated color="primary" label="Iniciar Nueva Atención" class="q-mt-lg br-xl q-px-xl" size="lg" icon="add" @click="nuevaAtencion" />
             </div>
          </div>
          
          <!-- Contenido Activo -->
          <div v-else class="active-content-render q-pa-lg">
             <!-- RENDERIZADOR ESTABILIZADO (Atención 2.0) -->
             <div class="service-view-port br-xl bg-white shadow-2 q-pa-none overflow-hidden" 
                  style="min-height: 500px" 
                  :key="'service-container-' + (servicioSeleccionado?.id || 'resumen')">
                
                <!-- 1. RESUMEN CLÍNICO -->
                <div v-if="servicioActivoTab === 'resumen'" key="resumen-content" class="animate-fade-in">
                  <ServicioResumen 
                    :atencion="atencionActualData"
                    :paciente="paciente"
                    :servicios-aplicados="serviciosAplicados"
                    @editar-servicio="id => servicioActivoTab = id"
                    @nueva-atencion="nuevaAtencion"
                    @imprimir-resumen="imprimirResumenAtencion"
                  />
                </div>

                <!-- 2. SERVICIO SELECCIONADO (Sin v-for para mayor estabilidad) -->
                <div v-else-if="servicioSeleccionado" :key="'content-' + servicioSeleccionado.id" class="animate-fade-in full-width">
                  
                  <ServicioConsultaGeneral
                    v-if="servicioSeleccionado.componente_clave === 'consulta'"
                    :atencion-id="String(atencionActualData.id)"
                    :servicio-id="servicioSeleccionado.id"
                    :datos-iniciales="servicioSeleccionado.datos"
                    :modo-lectura="servicioSeleccionado.completado || atencionActualData.estado === 'Finalizada'"
                    @servicio-actualizado="actualizarServicio"
                    @servicio-completado="completarServicio"
                    @servicio-eliminado="eliminarServicio"
                  />

                  <ServicioVacunacion
                    v-else-if="servicioSeleccionado.componente_clave === 'vacunacion'"
                    :atencion-id="String(atencionActualData.id)"
                    :servicio-id="servicioSeleccionado.id"
                    :datos-iniciales="servicioSeleccionado.datos"
                    :modo-lectura="servicioSeleccionado.completado || atencionActualData.estado === 'Finalizada'"
                    @servicio-actualizado="actualizarServicio"
                    @servicio-completado="completarServicio"
                    @servicio-eliminado="eliminarServicio"
                  />

                  <ServicioDesparasitacion
                    v-else-if="servicioSeleccionado.componente_clave === 'desparasitacion'"
                    :atencion-id="String(atencionActualData.id)"
                    :servicio-id="servicioSeleccionado.id"
                    :datos-iniciales="servicioSeleccionado.datos"
                    :modo-lectura="servicioSeleccionado.completado || atencionActualData.estado === 'Finalizada'"
                    @servicio-actualizado="actualizarServicio"
                    @servicio-completado="completarServicio"
                    @servicio-eliminado="eliminarServicio"
                  />

                  <template v-else-if="servicioSeleccionado.tipo_renderizado === 'dinamico'">
                    <ServicioDinamico
                      :schema="servicioSeleccionado"
                      :atencion-id="String(atencionActualData.id)"
                      :servicio-id="servicioSeleccionado.id"
                      :datos-iniciales="servicioSeleccionado.datos"
                      :catalogos="catalogosSistemas"
                      :modo-lectura="servicioSeleccionado.completado || atencionActualData.estado === 'Finalizada'"
                      @servicio-actualizado="actualizarServicio"
                      @servicio-completado="completarServicio"
                      @servicio-eliminado="eliminarServicio"
                      @imprimir-servicio="imprimirDocumentoServicio(servicioSeleccionado)"
                      @firmar-servicio="firmarServicio(servicioSeleccionado)"
                    />
                  </template>

                  <ServicioArchivos
                    v-else-if="servicioSeleccionado.componente_clave === 'archivos'"
                    :servicio-id="servicioSeleccionado.id"
                    :atencion-id="String(atencionActualData.id)"
                    :datos-iniciales="servicioSeleccionado.datos"
                    :modo-lectura="servicioSeleccionado.completado || atencionActualData.estado === 'Finalizada'"
                    @servicio-actualizado="actualizarServicio"
                    @servicio-completado="completarServicio"
                    @servicio-eliminado="eliminarServicio"
                  />

                  <div v-else class="q-pa-xl text-center">
                     <q-icon :name="servicioSeleccionado.icono" size="50px" color="grey-3" />
                     <div class="text-h6 text-grey-5">{{ servicioSeleccionado.nombre }}</div>
                     <div class="text-caption">Módulo especializado en proceso de optimización</div>
                     <q-btn flat color="negative" label="Remover Servicio" class="q-mt-lg" @click="eliminarServicio(servicioSeleccionado.id)" />
                  </div>
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>

    <!-- OVERLAYS & DIALOGS -->
    <q-inner-loading :showing="cargandoConfiguracion" class="bg-white" style="z-index: 9999">
      <q-spinner-dots color="primary" size="60px" />
      <div class="text-primary text-weight-bold q-mt-md">Preparando espacio de trabajo...</div>
    </q-inner-loading>

    <q-dialog v-model="showNuevaAtencionDialog" persistent>
      <q-card style="width: 450px" class="br-xl overflow-hidden">
        <q-card-section class="bg-primary text-white q-pa-lg">
          <div class="text-h6 text-weight-bolder">Nueva Atención Medica</div>
        </q-card-section>
        <q-card-section class="q-pa-lg q-gutter-md">
          <q-select v-model="formNuevaAtencion.veterinario_id" :options="profesionalesOpciones" label="Veterinario *" outlined dense emit-value map-options class="br-md" />
          <q-select v-model="formNuevaAtencion.motivo_id" :options="motivosOpciones" label="Motivo *" outlined dense emit-value map-options class="br-md" />
          <q-input v-model="formNuevaAtencion.observaciones" label="Observaciones" type="textarea" outlined dense class="br-md" />
        </q-card-section>
        <q-card-actions align="right" class="q-pa-lg">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn unelevated label="Comenzar" color="primary" @click="crearNuevaAtencion" class="br-lg q-px-lg" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showAddServiceDialog" position="right" maximized transition-show="slide-left" transition-hide="slide-right">
      <q-card style="width: 400px" class="column full-height">
        <q-card-section class="flex items-center q-pa-lg">
          <div class="text-h6 text-weight-bold">Servicios Disponibles</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section class="col scroll q-pa-md">
          <ServiciosDisponibles
            :servicios-aplicados="serviciosAplicados"
            :servicios-dinamicos="serviciosDinamicosParaLista"
            :servicios-catalogo="catalogoServiciosBD"
            :atencion-finalizada="atencionActualData?.estado === 'Finalizada'"
            @agregar-servicio="agregarServicioEnDialogo"
            @close="showAddServiceDialog = false"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showSearchDialog" maximized>
       <q-card class="bg-grey-1">
         <q-toolbar class="bg-white text-dark q-pa-md border-bottom">
           <q-btn flat round icon="arrow_back" v-close-popup />
           <q-toolbar-title class="text-weight-bolder">Buscador de Pacientes</q-toolbar-title>
         </q-toolbar>
         <q-card-section class="q-pa-xl">
            <div class="max-width-1000 q-mx-auto">
                <div class="row q-col-gutter-lg q-mb-xl">
                  <div class="col-12 col-md-4"><q-input v-model="busquedaFormData.propietario.primerapellido" label="Apellido" outlined dense bg-color="white" @keyup.enter="buscarPacientes" /></div>
                  <div class="col-12 col-md-4"><q-input v-model="busquedaFormData.mascota.nombre" label="Mascota" outlined dense bg-color="white" @keyup.enter="buscarPacientes" /></div>
                  <div class="col-12 col-md-4"><q-btn color="primary" label="Buscar" class="full-width" icon="search" @click="buscarPacientes" size="lg" unelevated /></div>
                </div>
                <CardBusquedaPropietarioMascota :rows="listaPropietariosBusqueda" @refresh-data="buscarPacientes" @mascota-seleccionada="onMascotaSeleccionada" />
            </div>
         </q-card-section>
       </q-card>
    </q-dialog>

    <DialogFirmarDocumento v-model="showFirmaDialog" :html-content="datosFirma.htmlContent" :document-name="datosFirma.documentName" @signed-and-saved="procesarGuardadoFirma" />
  </div>
</template>

<script>
import { ref, computed, onBeforeUnmount, watch, reactive, onMounted, defineAsyncComponent } from 'vue'
import { useQuasar } from 'quasar'
import { useMascotaSeleccionadaStore } from 'src/stores/mascotaSeleccionadaStore';
import { usePlantillas } from 'src/composables/usePlantillas'
import { useReportes } from 'src/composables/useReportes'
import { servicioDinamicoService } from 'src/services/servicioDinamico.service'
import { profesionalService } from 'src/services/profesional.service'
import { citaMotivoService } from 'src/services/citaMotivo.service'
import atencionService from 'src/services/atencion.service'
import { atencionServicioService } from 'src/services/atencionServicio.service'
import NdPeticionControl from 'src/controles/rest.control'
import { DtoParametros } from 'src/controles/dto.parametros'
import { useDialogStore } from 'src/stores/DialogoUbicacion'
import { useSignatureFlow } from 'src/composables/useSignatureFlow'

// Importación dinámica de componentes de servicios con lazy loading
const ServicioVacunacion = defineAsyncComponent(() => import('../components/servicios/ServicioVacunacion.vue'))
const ServicioDesparasitacion = defineAsyncComponent(() => import('../components/servicios/ServicioDesparasitacion.vue'))
const ServicioConsultaGeneral = defineAsyncComponent(() => import('../components/servicios/ServicioConsultaGeneral.vue'))
const ServiciosDisponibles = defineAsyncComponent(() => import('../components/servicios/ServiciosDisponibles.vue'))
const OrdenLaboratorio = defineAsyncComponent(() => import('../components/laboratorio/OrdenLaboratorio.vue'))
const ServicioRayosX = defineAsyncComponent(() => import('../components/servicios/ServicioRayosX.vue'))
const ServicioUltrasonido = defineAsyncComponent(() => import('src/components/servicios/ServicioUltrasonido.vue'))
const ServicioExploracionFisica = defineAsyncComponent(() => import('src/components/servicios/ServicioExploracionFisica.vue'))
const ServicioHospitalizacion = defineAsyncComponent(() => import('src/components/servicios/ServicioHospitalizacion.vue'))
const ServicioMedicamento = defineAsyncComponent(() => import('src/components/servicios/ServicioMedicamento.vue'))
const ServicioFisioterapia = defineAsyncComponent(() => import('src/components/servicios/ServicioFisioterapia.vue'))
const ServicioUrgencia = defineAsyncComponent(() => import('src/components/servicios/ServicioUrgencia.vue'))
const ServicioEstetica = defineAsyncComponent(() => import('../components/servicios/ServicioEstetica.vue'))
const ServicioRecetaMedica = defineAsyncComponent(() => import('../components/servicios/ServicioRecetaMedica.vue'))
const ServicioResumen = defineAsyncComponent(() => import('../components/servicios/ServicioResumen.vue'))
const ServicioDinamico = defineAsyncComponent(() => import('../components/servicios/ServicioDinamico.vue'))
const ServicioArchivos = defineAsyncComponent(() => import('../components/servicios/ServicioArchivos.vue'))

import CardBusquedaPropietarioMascota from 'src/components/card/CardBusquedaPropietarioMascota.vue'
import DialogFirmarDocumento from 'src/components/servicios/DialogFirmarDocumento.vue'

export default {
  name: 'AtencionPaciente',
  components: {
    ServicioVacunacion,
    ServicioDesparasitacion,
    ServicioConsultaGeneral,
    ServiciosDisponibles,
    OrdenLaboratorio,
    ServicioRayosX,
    ServicioUltrasonido,
    ServicioExploracionFisica,
    ServicioHospitalizacion,
    ServicioMedicamento,
    ServicioFisioterapia,
    ServicioUrgencia,
    ServicioEstetica,
    ServicioRecetaMedica,
    ServicioResumen,
    ServicioDinamico,
    ServicioArchivos,
    CardBusquedaPropietarioMascota,
    DialogFirmarDocumento
  },
  setup() {
    const $q = useQuasar()
    const mascotaSeleccionadaStore = useMascotaSeleccionadaStore()
    const store = useDialogStore()

    // Flujo de Firma Electrónica (Modularizado)
    const { 
      showFirmaDialog, 
      datosFirma, 
      visualizarYFirmar, 
      procesarGuardadoFirma 
    } = useSignatureFlow({
      onSaved: (adjunto, servicio) => {
        if (!servicio.datos.archivos_adjuntos) {
          servicio.datos.archivos_adjuntos = []
        }
        servicio.datos.archivos_adjuntos.push(adjunto)
      }
    })

    const firmarServicio = (servicio, idPlantilla = null) => {
      visualizarYFirmar(servicio, atencionActualData.value, paciente.value, idPlantilla)
    }

    // Estados reactivos
    const guardandoAtencion = ref(false)
    const servicioActivoTab = ref('resumen')
    const sidebarCollapsed = ref(false)
    const showAddServiceDialog = ref(false)
    const showNuevaAtencionDialog = ref(false)
    
    // Formulario para nueva atención
    const formNuevaAtencion = reactive({
      veterinario_id: null,
      motivo_id: null,
      observaciones: ''
    })
    const cargandoCatalogos = ref(false)
    const cargandoConfiguracion = ref(true)

    // Catálogos globales que se inyectan en servicios dinámicos
    const catalogosSistemas = reactive({
      VETERINARIOS: [
        { label: 'Dr. Carlos Mendoza', value: 'dr_carlos' },
        { label: 'Dra. Ana López', value: 'dra_ana' },
        { label: 'Dr. Sergio Ramos', value: 'dr_sergio' }
      ],
      PRODUCTOS_ESTETICA: [
        { label: 'Shampoo Avena Gold', value: 'sh_avena' },
        { label: 'Shampoo Hipoalergénico', value: 'sh_hipo' },
        { label: 'Acondicionador Sedoso', value: 'ac_sedoso' }
      ]
    })

    // Esquemas para servicios dinámicos (se cargan bajo demanda)
    const esquemasActivos = ref({})
    const cargandoEsquema = ref(false)
    const catalogoServiciosBD = ref([])
    
    // Estados para catálogos
    const profesionalesDisponibles = ref([])
    const motivosDisponibles = ref([])

    // Datos del paciente (ahora vienen del store)
    const paciente = computed(() => mascotaSeleccionadaStore.mascota || {
      id: '', nombre: '', especie: '', raza: '', edad: '', peso: '', propietario: '', telefono: ''
    })

    // Variables de Buscador (Faltantes restauradas)
    const showSearchDialog = ref(false)
    const listaPropietariosBusqueda = ref([])
    const busquedaFormData = reactive({
      propietario: { nombre: '', primerapellido: '' },
      mascota: { nombre: '' }
    })

    const buscarPacientes = async () => {
      try {
        $q.loading.show()
        // Importación dinámica para evitar problemas circulares si los hubiera, o usar services existentes
        // Usando fetch directo o servicio genérico por simplicidad y consistencia con lo previo
        const _peticion = new NdPeticionControl()
        const _unDtoParametros = new DtoParametros()
        
        _unDtoParametros.filtro = {
            id_sitio: 1, // Valor por defecto
            nombre: busquedaFormData.propietario.nombre,
            primerapellido: busquedaFormData.propietario.primerapellido,
            nombre_mascota: busquedaFormData.mascota.nombre
        }

        const respuesta = await _peticion.invocarMetodo('filtropropietariomascota/filtro', 'post', _unDtoParametros)
        listaPropietariosBusqueda.value = respuesta || []
        
        if (listaPropietariosBusqueda.value.length === 0) {
            $q.notify({ type: 'info', message: 'No se encontraron resultados' })
        }
      } catch (error) {
        console.error(error)
        $q.notify({ type: 'negative', message: 'Error al buscar pacientes' })
      } finally {
        $q.loading.hide()
      }
    }

    const limpiarFiltrosBusqueda = () => {
      busquedaFormData.propietario.nombre = ''
      busquedaFormData.propietario.primerapellido = ''
      busquedaFormData.mascota.nombre = ''
      listaPropietariosBusqueda.value = []
    }

    const onMascotaSeleccionada = async (evento) => {
        showSearchDialog.value = false
        // Usar paciente_id (mismo campo que id_paciente en la tabla atencion)
        if (paciente.value && paciente.value.paciente_id) {
            await cargarAtencionesDesdeBackend(paciente.value.paciente_id)
        }
    }

    // Funciones de carga de catálogos (mismo patrón que DialogoAsignarCita.vue)
    const cargarProfesionalesParaAtencion = async () => {
      try {
        const profs = await profesionalService.getProfesionales()
        profesionalesDisponibles.value = profs
        // Actualizar catálogo global para servicios dinámicos
        catalogosSistemas.VETERINARIOS = profs.map(p => ({
          label: `${p.nombre || ''} ${p.primerapellido || ''} ${p.segundoapellido || ''}`.trim() || 'Sin nombre',
          value: p.id
        }))
      } catch (error) {
        console.error('Error al cargar profesionales:', error)
        $q.notify({ type: 'warning', message: 'No se pudieron cargar los profesionales', caption: error.message })
        profesionalesDisponibles.value = []
      }
    }

    const cargarMotivosParaAtencion = async () => {
      try {
        const motivos = await citaMotivoService.getMotivos()
        motivosDisponibles.value = Array.isArray(motivos) ? motivos.filter(m => m.activo !== false && m.activo !== 'N') : []
      } catch (error) {
        console.error('Error al cargar motivos:', error)
        $q.notify({ type: 'warning', message: 'No se pudieron cargar los motivos', caption: error.message })
        motivosDisponibles.value = []
      }
    }

    // Computed para opciones de selects
    const profesionalesOpciones = computed(() => {
      return profesionalesDisponibles.value.map(p => ({
        label: (
          p.nombre_completo ||
          `${p.poblador_nombre || p.nombre || ''} ${p.poblador_primerapellido || p.primerapellido || ''} ${p.poblador_segundoapellido || p.segundoapellido || ''}`.trim() ||
          'Sin nombre'
        ),
        value: p.id,
        cedula: p.cedula || null,
        especialidad: p.especialidad || null,
        activo: p.activo
      }))
    })

    const motivosOpciones = computed(() => {
      return motivosDisponibles.value.map(m => ({
        label: m.descripcion || m.nombre || 'Sin descripción',
        value: m.id
      }))
    })

    // Lista de atenciones del paciente
    const atenciones = ref([])

    // Atención actual seleccionada
    const atencionActual = ref(0)

    // Convertir esquemas activos a formato de lista de servicios
    const serviciosDinamicosParaLista = computed(() => {
      return Object.values(esquemasActivos.value).map(esquema => ({
        id: esquema.id,
        nombre: esquema.servicio,
        descripcion: esquema.descripcion || 'Servicio configurable',
        icono: esquema.icono || 'auto_awesome',
        identificador: esquema.identificador
      }))
    })

    // Servicios aplicados en esta atención
    const serviciosAplicados = computed(() => {
      return atenciones.value[atencionActual.value]?.servicios || []
    })

    // Atención actual con fallback seguro (evita crashes cuando atenciones está vacío)
    const atencionActualData = computed(() => {
      return atenciones.value[atencionActual.value] || {
        id: null, numero: '', fecha: '', hora: '',
        fechaFinalizacion: '', horaFinalizacion: '',
        veterinario: '', estado: 'En curso', servicios: []
      }
    })

    // Servicio seleccionado actualmente para mostrar en el Workspace
    const servicioSeleccionado = computed(() => {
      if (!servicioActivoTab.value || servicioActivoTab.value === 'resumen') return null
      return serviciosAplicados.value.find(s => s.id === servicioActivoTab.value)
    })

     // Watcher para actualizar la pestaña activa y cargar esquema si es necesario
    watch(serviciosAplicados, (nuevosServicios) => {
      if (nuevosServicios.length > 0 && !servicioActivoTab.value) {
        servicioActivoTab.value = 'resumen'
      } else if (nuevosServicios.length === 0) {
        servicioActivoTab.value = null
      }
    }, { immediate: true, deep: true })

    watch(servicioActivoTab, async (nuevoTab) => {
      if (nuevoTab && nuevoTab !== 'resumen') {
        const servicio = serviciosAplicados.value.find(s => s.id === nuevoTab)
        if (servicio && servicio.tipo_renderizado === 'dinamico' && servicio.identificador) {
          await cargarEsquema(servicio.identificador, servicio.id_servicio_def)
        }
      }
    })

    // Helper para obtener el nombre del profesional por ID desde el catálogo cargado
    const obtenerNombreProfesional = (id) => {
      if (!id) return null
      const prof = profesionalesDisponibles.value.find(p => String(p.id) === String(id))
      if (!prof) return null
      
      return prof.nombre_completo || 
             `${prof.poblador_nombre || prof.nombre || ''} ${prof.poblador_primerapellido || prof.primerapellido || ''} ${prof.poblador_segundoapellido || prof.segundoapellido || ''}`.trim() ||
             'Sin nombre'
    }

    // Métodos
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short'
      })
    }

    const navigateCards = (direction) => {
      if (direction === 'prev' && atencionActual.value > 0) {
        atencionActual.value--
      } else if (direction === 'next' && atencionActual.value < atenciones.value.length - 1) {
        atencionActual.value++
      }
    }

    const verDetallesAtencion = () => {
      const atencion = atenciones.value[atencionActual.value]
      $q.dialog({
        title: `Detalles de ${atencion.numero}`,
        message: `
          <div>
            <strong>Fecha:</strong> ${atencion.fecha} ${atencion.hora}<br>
            <strong>Veterinario:</strong> ${atencion.veterinario}<br>
            <strong>Estado:</strong> ${atencion.estado}<br>
            <strong>Servicios:</strong> ${atencion.servicios.length}
          </div>
        `,
        html: true,
        ok: 'Cerrar'
      })
    }

    // Función para cargar esquema de servicio bajo demanda
    const cargarEsquema = async (identificador, idServicioDef) => {
      if (esquemasActivos.value[identificador]) return
      
      cargandoEsquema.value = true
      try {
        const esquema = await servicioDinamicoService.getEsquemaServicio(idServicioDef)
        if (esquema) {
          esquemasActivos.value[identificador] = esquema
          console.log(`✅ Esquema cargado para: ${identificador}`)
        }
      } catch (error) {
        console.error(`Error al cargar esquema ${identificador}:`, error)
        $q.notify({ type: 'negative', message: 'Error al cargar el diseño del servicio' })
      } finally {
        cargandoEsquema.value = false
      }
    }

    const nuevaAtencion = async () => {
      // Validar que haya una mascota seleccionada
      if (!paciente.value || !paciente.value.id) {
        $q.notify({
          type: 'warning',
          message: 'Debes seleccionar un paciente primero',
          caption: 'Usa el botón "Buscar Paciente" para seleccionar una mascota',
          icon: 'pets',
          position: 'top'
        })
        return
      }

      // Resetear formulario
      formNuevaAtencion.veterinario_id = null
      formNuevaAtencion.motivo_id = null
      formNuevaAtencion.observaciones = ''

      // Abrir diálogo de inmediato y cargar catálogos en paralelo
      showNuevaAtencionDialog.value = true
      cargandoCatalogos.value = true
      try {
        // Cargar catálogos desde el backend (igual que DialogoAsignarCita.vue)
        await Promise.all([
          cargarMotivosParaAtencion(),
          cargarProfesionalesParaAtencion()
        ])
      } finally {
        cargandoCatalogos.value = false
      }
    }

    // Función asíncrona para crear atención
    const crearNuevaAtencion = async () => {
      try {
        $q.loading.show()
        
        const datosNuevaAtencion = {
          id_paciente: paciente.value.paciente_id,
          id_profesional: formNuevaAtencion.veterinario_id,
          id_motivo: formNuevaAtencion.motivo_id, 
          observacion: formNuevaAtencion.observaciones,
          estado: 'En curso',
          activo: 'S',
          id_sucursal: store.sucursalSeleccionada.id,
          fechaalta: new Date().toISOString(),
          
        }

        const respuesta = await atencionService.crearAtencion(datosNuevaAtencion)
        
        if (respuesta) {
            // Cerrar el diálogo primero para que el usuario no espere bloqueado
            showNuevaAtencionDialog.value = false
            $q.notify({ type: 'positive', message: 'Atención creada exitosamente' })
            // Recargar atenciones - usar paciente_id (mismo que id_paciente en la tabla atencion)
            const idPaciente = paciente.value.paciente_id
            if (idPaciente) {
              await cargarAtencionesDesdeBackend(idPaciente)
            }
        }
      } catch (error) {
        console.error('Error al crear atención:', error)
        $q.notify({ type: 'negative', message: 'Error al crear la atención' })
      } finally {
        $q.loading.hide()
      }
    }



    const agregarServicioEnDialogo = async (servicio) => {
      if (atenciones.value.length === 0) {
        $q.notify({ type: 'warning', message: 'Debe crear una atención primero' })
        return
      }

      if (atenciones.value[atencionActual.value].estado === 'Finalizada') {
        $q.notify({
          type: 'negative',
          message: 'No se pueden agregar servicios a una atención finalizada'
        })
        return
      }

      try {
        $q.loading.show()

        // Crear registro en BD usando el ID real del catálogo SERVICIO
        const registrado = await atencionServicioService.crear({
          id_atencion:     atenciones.value[atencionActual.value].id,
          id_servicio: servicio.id_servicio || servicio.id,  // ID real de la tabla SERVICIO
          estado:          'pendiente'
        })

        // Usar el ID real de BD (no temporal) para poder hacer PUT/DELETE después
        const nuevoServicio = {
          id:               String(registrado?.id || `${servicio.tipo}_${Date.now()}`),  // ID de BD como string
          idBD:             registrado?.id,          // guardamos el int de BD para operaciones REST
          tipo:             (servicio.componente_clave || servicio.tipo || servicio.identificador)?.toLowerCase(),
          nombre:           servicio.nombre,
          icono:            servicio.icono,
          color:            servicio.color,
          tipo_renderizado: servicio.tipo_renderizado,
          componente_clave: servicio.componente_clave?.toLowerCase(),
          identificador:    servicio.identificador,
          id_plantilla:     servicio.id_plantilla,
          completado:       false,
          timestamp:        new Date().toLocaleString(),
          datos:            {}
        }

        if (!atenciones.value[atencionActual.value].servicios) {
          atenciones.value[atencionActual.value].servicios = []
        }

        atenciones.value[atencionActual.value].servicios.push(nuevoServicio)
        servicioActivoTab.value = nuevoServicio.id

        $q.notify({
          type: 'positive',
          message: `Servicio ${servicio.nombre} agregado`,
          icon: 'check_circle'
        })
        showAddServiceDialog.value = false
      } catch (error) {
        console.error('Error al agregar servicio:', error)
        $q.notify({ type: 'negative', message: 'Error al agregar el servicio' })
      } finally {
        $q.loading.hide()
      }
    }

    const actualizarServicio = (servicioId, nuevosDatos) => {
      const servicio = serviciosAplicados.value.find(s => s.id === servicioId)
      if (servicio) {
        servicio.datos = { ...servicio.datos, ...nuevosDatos }
      }
    }

    const completarServicio = async (servicioId, datosFinales = {}) => {
      const servicio = serviciosAplicados.value.find(s => s.id === servicioId)
      if (!servicio) return

      try {
        // 1. Actualizar estado y observaciones en la tabla principal (ATENCION_SERVICIOS)
        if (servicio.idBD) {
          await atencionServicioService.completar(servicio.idBD, {
            observaciones: datosFinales.observaciones || ''
          })

          // 2. Guardar en tabla especializada si el servicio lo requiere
          // Nota: servicio.tipo suele ser el componente_clave o el tipo hardcoded
          const clave = servicio.componente_clave || servicio.tipo

          if (clave === 'vacunacion') {
            const vacunas = datosFinales.vacunas || []
            
            for (const v of vacunas) {
              const payloadVacuna = {
                id_atencion_servicio: servicio.idBD,
                id_producto:          v.producto?.id || v.producto?.value,
                id_tipo_vacuna:       v.tipoVacuna?.id_original || (v.tipoVacuna?.value ? Number(v.tipoVacuna.value) : null),
                id_laboratorio:       v.laboratorio?.id_original || (v.laboratorio?.value ? Number(v.laboratorio.value) : null),
                lote:                 v.numeroLote || v.lote?.numeroLote,
                fecha_vencimiento:    v.fechaVencimiento,
                dosis:                Number(v.dosisAplicada),
                id_via_administracion: v.viaAdministracion?.id_original || (v.viaAdministracion?.value ? Number(v.viaAdministracion.value) : null),
                sitio_aplicacion:     v.sitioAplicacion,
                proxima_vacuna:       v.proximaVacuna,
                reacciones_adversas:  v.observaciones || 'N'
              }

              if (v.idBD) {
                await atencionServicioService.actualizarVacunacion(v.idBD, payloadVacuna)
              } else {
                await atencionServicioService.guardarVacunacion(payloadVacuna)
              }

              // 3. Programar notificación de refuerzo si existe fecha
              /* Comentado temporalmente por el usuario
              if (v.proximaVacuna) {
                await atencionServicioService.crearNotificacion({
                  id_atencion_servicio: servicio.idBD,
                  id_propietario: atencionActualData.value.id_propietario || paciente.value.id_propietario,
                  id_mascota: atencionActualData.value.id_mascota || paciente.value.id,
                  tipo_notificacion: 'vacuna',
                  mensaje: `Refuerzo de ${v.tipoVacuna?.label || v.tipoVacuna}`,
                  fecha_programada: v.proximaVacuna
                })
              }
              */
            }
          } else if (clave === 'desparacitacion' || clave === 'desparasitacion') {
            // Mapeo selectivo de campos para desparasitación (FRONT -> BACK)
            await atencionServicioService.guardarDesparasitacion({
              id_atencion_servicio: servicio.idBD,
              tipo_desparasitante: datosFinales.tipoTratamiento,
              producto_nombre: datosFinales.producto,
              laboratorio: datosFinales.laboratorio || '',
              lote: datosFinales.lote || '',
              dosis: String(datosFinales.dosisAplicada || ''),
              via_administracion: datosFinales.viaAdministracion || '',
              parasitos_objetivo: Array.isArray(datosFinales.tipoParasitos) 
                                 ? datosFinales.tipoParasitos.join(', ') 
                                 : (datosFinales.tipoParasitos || ''),
              proxima_desparasitacion: datosFinales.proximaDesparacitacion,
              observaciones: datosFinales.observaciones || ''
            })

            // 3. Programar notificación de refuerzo si existe fecha
            /* Comentado temporalmente por el usuario
            if (datosFinales.proximaDesparacitacion) {
              await atencionServicioService.crearNotificacion({
                id_atencion_servicio: servicio.idBD,
                id_propietario: atencionActualData.value.id_propietario || paciente.value.id_propietario,
                id_mascota: atencionActualData.value.id_mascota || paciente.value.id,
                tipo_notificacion: 'desparasitacion',
                mensaje: `Recordatorio: Próxima desparasitación para ${paciente.value.nombre}`,
                fecha_programada: datosFinales.proximaDesparacitacion
              })
            }
            */
          } else if (clave === 'consulta') {
            // Mapeo de campos para consulta general (FRONT -> BACK)
            await atencionServicioService.guardarConsulta({
              id_atencion_servicio: servicio.idBD,
              id_motivo: datosFinales.id_motivo ? Number(datosFinales.id_motivo) : null,
              motivo_consulta: datosFinales.motivo_detallado || '',
              motivo_detallado: datosFinales.motivo_detallado || '',
              anamnesis: datosFinales.anamnesis || '',
              hallazgos_examen: datosFinales.hallazgos_examen || '',
              id_diagnostico: datosFinales.id_diagnostico ? Number(datosFinales.id_diagnostico) : null,
              diagnostico: '',
              diagnostico_complemento: datosFinales.diagnostico_complemento || '',
              indicaciones_medicas: datosFinales.indicaciones_medicas || '',
              pronostico: datosFinales.pronostico || '',
              proxima_cita: datosFinales.proxima_cita || null,
              observaciones: datosFinales.observaciones || ''
            })
          }
        }

        // Actualizar estado local
        servicio.completado = true
        servicio.datos = { ...servicio.datos, ...datosFinales }

        $q.notify({
          type: 'positive',
          message: `${servicio.nombre} completado exitosamente`,
          position: 'top-right',
          timeout: 2000,
          icon: 'check_circle'
        })
      } catch (error) {
        console.error('Error al completar servicio en BD:', error)
        // Aun así marcamos como completado localmente para no bloquear al usuario
        servicio.completado = true
        servicio.datos = { ...servicio.datos, ...datosFinales }
        $q.notify({
          type: 'warning',
          message: `${servicio.nombre} completado (error al sincronizar con BD)`,
          position: 'top-right'
        })
      }
    }

    const eliminarServicio = (servicioId) => {
      const servicio = serviciosAplicados.value.find(s => s.id === servicioId)

      $q.dialog({
        title: 'Confirmar eliminación',
        message: `¿Estás seguro de que deseas eliminar el servicio "${servicio?.nombre}"?`,
        cancel: true,
        persistent: true
      }).onOk(async () => {
        // Cancelar (soft-delete) en BD si tiene ID real
        if (servicio?.idBD) {
          try {
            await atencionServicioService.actualizar(servicio.idBD, { estado: 'cancelado' })
          } catch (error) {
            console.error('Error al cancelar servicio en BD:', error)
          }
        }

        const servicios = atenciones.value[atencionActual.value].servicios
        const index = servicios.findIndex(s => s.id === servicioId)
        if (index > -1) {
          servicios.splice(index, 1)

          if (servicioActivoTab.value === servicioId) {
            servicioActivoTab.value = servicios.length > 0 ? 'resumen' : null
          }

          $q.notify({
            type: 'info',
            message: 'Servicio eliminado',
            position: 'top-right',
            timeout: 2000
          })
        }
      })
    }

    const guardarAtencion = async () => {
      guardandoAtencion.value = true

      try {
        const atencion = atenciones.value[atencionActual.value]
        if (!atencion?.id) {
          $q.notify({ type: 'warning', message: 'No hay atención activa para guardar' })
          return
        }

        await atencionService.actualizarAtencion(atencion.id, {
          observacion: atencion.observaciones || ''
        })

        $q.notify({
          type: 'positive',
          message: 'Atención guardada correctamente',
          position: 'top-right',
          icon: 'save'
        })
      } catch (error) {
        console.error('Error al guardar atención:', error)
        $q.notify({ type: 'negative', message: 'Error al guardar la atención' })
      } finally {
        guardandoAtencion.value = false
      }
    }

    const finalizarAtencion = () => {
      $q.dialog({
        title: 'Finalizar Atención',
        message: '¿Está seguro de que desea finalizar esta atención? Una vez finalizada no se podrá modificar.',
        cancel: true,
        persistent: true
      }).onOk(async () => {
        try {
            $q.loading.show()
            const atencion = atenciones.value[atencionActual.value]
            
            const fechaFin = new Date()
            const datosUpdate = {
                estado: 'Finalizada',
                fecha_finalizacion: fechaFin.toISOString().split('T')[0],
                hora_finalizacion: fechaFin.toTimeString().split(' ')[0].substring(0, 5)
            }
            
            const respuesta = await atencionService.actualizarAtencion(atencion.id, datosUpdate)
            
            if (respuesta) {
                atencion.estado = 'Finalizada'
                atencion.fechaFinalizacion = datosUpdate.fecha_finalizacion
                atencion.horaFinalizacion = datosUpdate.hora_finalizacion
    
                $q.notify({
                  type: 'positive',
                  message: 'Atención finalizada correctamente',
                  position: 'top-right',
                  icon: 'check_circle'
                })
            }
        } catch (error) {
            console.error('Error al finalizar atención:', error)
            $q.notify({ type: 'negative', message: 'Error al finalizar la atención' })
        } finally {
            $q.loading.hide()
        }
      })
    }

    const { cargarPlantillaPorId, cargarPlantillaPorCodigo, procesarHtml, generarPDF } = usePlantillas()
    const { imprimirPlantilla, imprimirVacunacion, imprimirConsulta } = useReportes()

    const imprimirDocumentoServicio = async (servicio, tipo = 'especial', idPlantillaManual = null) => {
      // Especial: Si es un servicio de Vacunación, usamos el backend con diseño programático
      const esVacunacion = servicio.tipo?.toLowerCase() === 'vacunacion' || servicio.componente_clave === 'vacunacion'
      
      if (esVacunacion && tipo === 'especial') {
        const datosGeneracion = {
          paciente: {
            nombre: paciente.value.nombre,
            especie: paciente.value.especie,
            raza: paciente.value.raza,
            peso: paciente.value.peso ? `${paciente.value.peso} kg` : ''
          },
          propietario: {
            nombre: `${paciente.value.propietario?.nombre || ''} ${paciente.value.propietario?.primerapellido || ''}`.trim(),
            telefono: paciente.value.propietario?.telefono1 || paciente.value.propietario?.telefono2
          },
          atencion_numero: atenciones.value[atencionActual.value].numero,
          atencion_fecha: atenciones.value[atencionActual.value].fecha,
          veterinario: atenciones.value[atencionActual.value].veterinario,
          vacunas: servicio.datos?.vacunas?.map(v => ({
            tipo: typeof v.tipoVacuna === 'object' ? v.tipoVacuna?.label : v.tipoVacuna,
            laboratorio: typeof v.laboratorio === 'object' ? v.laboratorio?.label : v.laboratorio,
            lote: v.numeroLote || v.lote?.numeroLote,
            dosis: v.dosisAplicada,
            via: typeof v.viaAdministracion === 'object' ? v.viaAdministracion?.label : v.viaAdministracion,
            sitio: v.sitioAplicacion,
            proxima: v.proximaVacuna,
            observaciones: v.observaciones
          })) || []
        }
        await imprimirVacunacion(datosGeneracion)
        return
      }

      // Especial: Si es un servicio de Consulta, usamos el backend con diseño programático
      const esConsulta = servicio.tipo?.toLowerCase() === 'consulta' || servicio.componente_clave === 'consulta'
      
      if (esConsulta && tipo === 'especial') {
        const datosGeneracion = {
          paciente: {
            nombre: paciente.value.nombre,
            especie: paciente.value.especie,
            raza: paciente.value.raza,
            peso: paciente.value.peso ? `${paciente.value.peso} kg` : ''
          },
          propietario: {
            nombre: `${paciente.value.propietario?.nombre || ''} ${paciente.value.propietario?.primerapellido || ''}`.trim(),
            telefono: paciente.value.propietario?.telefono1 || paciente.value.propietario?.telefono2
          },
          atencion_numero: atenciones.value[atencionActual.value].numero,
          atencion_fecha: atenciones.value[atencionActual.value].fecha,
          veterinario: atenciones.value[atencionActual.value].veterinario,
          motivo_consulta: servicio.datos?.motivo_detallado || servicio.datos?.motivo_consulta,
          anamnesis: servicio.datos?.anamnesis,
          hallazgos_examen: servicio.datos?.hallazgos_examen,
          diagnostico: servicio.datos?.diagnostico,
          diagnostico_complemento: servicio.datos?.diagnostico_complemento,
          indicaciones_medicas: servicio.datos?.indicaciones_medicas || servicio.datos?.receta_indicaciones,
          pronostico: servicio.datos?.pronostico,
          proxima_cita: servicio.datos?.proxima_cita,
          observaciones: servicio.datos?.observaciones
        }
        await imprimirConsulta(datosGeneracion)
        return
      }

      // Otras plantillas de la base de datos (Ej: Desparasitacion, etc)
      let idPlantilla = idPlantillaManual || servicio.id_plantilla || (esquemasActivos.value && esquemasActivos.value[servicio.tipo]?.id_plantilla)
      
      // Si no tenemos ID pero hay plantillas_servicio, tomar la primera por defecto
      if (!idPlantilla && servicio.plantillas_servicio?.length > 0) {
        idPlantilla = servicio.plantillas_servicio[0].id_plantilla
      }

      if (!idPlantilla) {
        $q.notify({ type: 'warning', message: 'Este servicio no tiene una plantilla asociada' })
        return
      }

      const datosVariables = {
        ...servicio.datos,
        paciente_nombre: paciente.value.nombre,
        propietario_nombre: paciente.value.propietario?.nombre,
        fecha_atencion: atenciones.value[atencionActual.value].fecha,
        atencion_numero: atenciones.value[atencionActual.value].numero
      }
      
      await imprimirPlantilla(idPlantilla, datosVariables)
    }

    const imprimirResumenAtencion = async () => {
      $q.loading.show({ message: 'Generando resumen de atención...' })
      try {
        // Cargar plantilla por código predeterminado para resumen
        const plantilla = await cargarPlantillaPorCodigo('RESUMEN_ATENCION')
        if (!plantilla) {
          $q.notify({ type: 'warning', message: 'No se encontró la plantilla "RESUMEN_ATENCION"' })
          return
        }

        const datosVariables = {
          atencion_numero: atenciones.value[atencionActual.value].numero,
          atencion_fecha: atenciones.value[atencionActual.value].fecha,
          paciente_nombre: paciente.value.nombre,
          paciente_especie: paciente.value.especie,
          paciente_raza: paciente.value.raza,
          propietario_nombre: `${paciente.value.propietario?.nombre} ${paciente.value.propietario?.primerapellido}`,
          servicios: serviciosAplicados.value.map(s => s.nombre).join(', '),
          // En un sistema real, el resumen incluiría una tabla procesada de servicios
        }

        const html = procesarHtml(plantilla.contenido_html, datosVariables)
        await generarPDF(html, { filename: `Resumen_${atenciones.value[atencionActual.value].numero}.pdf` })
      } catch (error) {
        console.error(error)
        $q.notify({ type: 'negative', message: 'Error al generar resumen' })
      } finally {
        $q.loading.hide()
      }
    }

    // Carga las atenciones del paciente desde el backend y las mapea al formato local
    const cargarAtencionesDesdeBackend = async (idMascota) => {
      try {
        const datos = await atencionService.getAtencionesPorMascota(idMascota)
        const lista = Array.isArray(datos)
          ? datos
          : (datos?.elemento || datos?.data || [])

        if (!Array.isArray(lista) || lista.length === 0) {
          atenciones.value = []
          atencionActual.value = 0
          return
        }

        // Mapear atenciones básicas primero
        const atencionesBase = lista.map(a => {
          // Intentar resolver el nombre del profesional si no viene el objeto Join
          const nombreProfesional = a.profesional?.nombre_completo ||
            `${a.profesional?.poblador_nombre || ''} ${a.profesional?.poblador_primerapellido || ''}`.trim() ||
            obtenerNombreProfesional(a.id_profesional) ||
            a.veterinario || 
            'Sin asignar'

          return {
            id: a.id,
            id_profesional: a.id_profesional,
            numero: a.numero || a.identificador || `A-${a.id}`,
            fecha: a.fecha || a.fechaalta?.split('T')[0] || '',
            hora: a.hora || a.fechaalta?.split('T')[1]?.substring(0, 5) || '',
            fechaFinalizacion: a.fecha_finalizacion || a.fechafinalizacion || '',
            horaFinalizacion: a.hora_finalizacion || a.horafinalizacion || '',
            veterinario: nombreProfesional,
            estado: a.estado || 'En curso',
            servicios: []
          }
        })

        atenciones.value = atencionesBase
        atencionActual.value = 0

        // Cargar servicios de la primera atención (la más reciente) de inmediato
        if (atencionesBase.length > 0) {
          await cargarServiciosDeAtencion(0)
        }
      } catch (error) {
        console.error('Error al cargar atenciones desde backend:', error)
        $q.notify({ type: 'warning', message: 'No se pudieron cargar las atenciones del paciente' })
      }
    }

    // Carga los servicios de una atención específica desde BD y los agrega al array local
    const cargarServiciosDeAtencion = async (indiceAtencion) => {
      const atencion = atenciones.value[indiceAtencion]
      if (!atencion?.id) return

      try {
        const serviciosBD = await atencionServicioService.getPorAtencion(atencion.id)
        atenciones.value[indiceAtencion].servicios = await Promise.all(
          serviciosBD
            .filter(s => s.estado !== 'cancelado')
            .map(async s => {
              const defClave = s.servicio?.componente_clave || s.servicio?.identificador || String(s.id_servicio)
              const serviceDef = catalogoServiciosBD.value.find(c => c.id === s.id_servicio)
              
              let nombreMostrar = s.servicio?.nombre || serviceDef?.nombre || `Servicio ${s.id_servicio}`
              if (nombreMostrar.toUpperCase().startsWith('SERVICIO ') && serviceDef?.componente_clave) {
                  nombreMostrar = serviceDef.componente_clave.charAt(0).toUpperCase() + serviceDef.componente_clave.slice(1)
              }

              const tipo = defClave?.toLowerCase()
              let datos = {}

              // Si es vacunación, cargar el detalle especializado
              if (tipo === 'vacunacion' || (serviceDef?.componente_clave?.toLowerCase() === 'vacunacion')) {
                try {
                  const vacunasBD = await atencionServicioService.getVacunacionByAtencionServicio(s.id)
                  // Mapear de vuelta al formato del componente
                  datos = {
                    vacunas: vacunasBD.map(v => ({
                      idBD: v.id,
                      producto: v.id_producto ? { id: v.id_producto, value: v.id_producto } : null,
                      tipoVacuna: v.id_tipo_vacuna ? { value: v.id_tipo_vacuna, label: v.tipo_vacuna } : v.tipo_vacuna,
                      laboratorio: v.id_laboratorio ? { value: v.id_laboratorio, label: v.laboratorio } : v.laboratorio,
                      numeroLote: v.lote,
                      fechaVencimiento: v.fecha_vencimiento,
                      dosisAplicada: v.dosis,
                      viaAdministracion: v.id_via_administracion ? { value: v.id_via_administracion, label: v.via_administracion } : v.via_administracion,
                      sitioAplicacion: v.sitio_aplicacion,
                      proximaVacuna: v.proxima_vacuna,
                      observaciones: v.reacciones_adversas === 'N' ? '' : v.reacciones_adversas
                      // No resetear si ya venía de antes (aunque en este punto datos está vacío)
                    }))
                  }
                } catch (err) {
                  console.error('Error al cargar detalle de vacunación:', err)
                }
              } else if (tipo === 'consulta' || (serviceDef?.componente_clave?.toLowerCase() === 'consulta')) {
                try {
                  const consultasBD = await atencionServicioService.getConsultaByAtencionServicio(s.id)
                  if (consultasBD && consultasBD.length > 0) {
                    const c = consultasBD[0]
                    datos = {
                      id_motivo: c.id_motivo,
                      motivo_detallado: c.motivo_detallado || c.motivo_consulta,
                      anamnesis: c.anamnesis,
                      hallazgos_examen: c.hallazgos_examen,
                      id_diagnostico: c.id_diagnostico,
                      diagnostico_complemento: c.diagnostico_complemento,
                      indicaciones_medicas: c.indicaciones_medicas || c.plan_tratamiento,
                      pronostico: c.pronostico,
                      proxima_cita: c.proxima_cita
                    }
                  }
                } catch (err) {
                  console.error('Error al cargar detalle de consulta:', err)
                }
              } else if (tipo === 'desparasitacion' || tipo === 'desparasitacion' || (serviceDef?.componente_clave?.toLowerCase() === 'desparasitacion')) {
                try {
                  const desparasitacionesBD = await atencionServicioService.getDesparasitacionByAtencionServicio(s.id)
                  if (desparasitacionesBD && desparasitacionesBD.length > 0) {
                    const d = desparasitacionesBD[0]
                    datos = {
                      tipoTratamiento: d.tipo_desparasitante,
                      producto: d.producto_nombre,
                      laboratorio: d.laboratorio,
                      lote: d.lote,
                      dosisAplicada: d.dosis,
                      viaAdministracion: d.via_administracion,
                      tipoParasitos: d.parasitos_objetivo ? d.parasitos_objetivo.split(',').map(p => p.trim()) : [],
                      proximaDesparacitacion: d.proxima_desparasitacion,
                      observaciones: d.observaciones
                    }
                  }
                } catch (err) {
                  console.error('Error al cargar detalle de desparasitación:', err)
                }
              } else if (tipo === 'receta' || (serviceDef?.componente_clave?.toLowerCase() === 'receta')) {
                try {
                  const recetasBD = await atencionServicioService.getRecetaByAtencionServicio(s.id)
                  if (recetasBD && recetasBD.length > 0) {
                    const r = recetasBD[0]
                    datos = {
                      receta_indicaciones: r.receta_indicaciones,
                      observaciones: r.observaciones
                    }
                  }
                } catch (err) {
                  console.error('Error al cargar detalle de receta:', err)
                }
              }

              return {
                id:               String(s.id),
                idBD:             s.id,
                tipo:             tipo,
                nombre:           nombreMostrar,
                icono:            s.servicio?.icono || serviceDef?.icono || 'medical_services',
                color:            s.servicio?.color || serviceDef?.color || 'primary',
                tipo_renderizado: s.servicio?.tipo_renderizado || serviceDef?.tipo_renderizado,
                componente_clave: (s.servicio?.componente_clave || serviceDef?.componente_clave)?.toLowerCase(),
                identificador:    s.servicio?.identificador || serviceDef?.identificador,
                id_plantilla:     s.servicio?.id_plantilla || serviceDef?.id_plantilla,
                plantillas_servicio: ((s.servicio?.plantillas_servicio && s.servicio.plantillas_servicio.length > 0) ? s.servicio.plantillas_servicio : (serviceDef?.plantillas_servicio || [])).filter(p => !p.activo || p.activo === 'S'),
                 id_servicio_def:  s.id_servicio,
                completado:       s.estado === 'completado',
                datos:            datos,
                timestamp:        s.fecha_creacion ? new Date(s.fecha_creacion).toLocaleString() : ''
              }
            })
        )
      } catch (error) {
        console.error(`Error al cargar servicios de atención ${atencion.id}:`, error)
      }
    }

    // Cargar catálogos y esquemas dinámicos al montar
    onMounted(async () => {
      cargandoConfiguracion.value = true
      try {
        // Cargar catálogos básicos y esquemas en paralelo para mayor velocidad
        const [serviciosDinamicos, _] = await Promise.all([
          servicioDinamicoService.getServicios(),
          Promise.all([
            cargarMotivosParaAtencion(),
            cargarProfesionalesParaAtencion()
          ])
        ])
        
        // No cargamos los esquemas aquí (Optimización Lazy Loading)
        // Solo guardamos la lista básica de servicios disponibles

        // Guardar catálogo completo para ServiciosDisponibles
        catalogoServiciosBD.value = serviciosDinamicos
        
        // Si ya hay mascota seleccionada, cargar sus atenciones
        const idPaciente = paciente.value.paciente_id || paciente.value.id
        if (idPaciente) {
            await cargarAtencionesDesdeBackend(idPaciente)
        }
      } catch (error) {
        console.error('Error al cargar la configuración inicial:', error)
        $q.notify({ 
          type: 'warning', 
          message: 'Error al iniciar el módulo', 
          caption: 'Algunos componentes podrían no funcionar correctamente' 
        })
      } finally {
        cargandoConfiguracion.value = false
      }
    })

    // Watcher para cargar atenciones cuando cambia el paciente seleccionado (Buscador externo)
    watch(() => paciente.value?.paciente_id || paciente.value?.id, async (newId) => {
      if (newId) {
        console.log('🔄 Detectado cambio de paciente:', newId)
        await cargarAtencionesDesdeBackend(newId)
      } else {
        atenciones.value = []
      }
    })

    // Watcher para cargar servicios al navegar entre atenciones del historial
    watch(atencionActual, async (nuevoIndice) => {
      const atencion = atenciones.value[nuevoIndice]
      if (atencion && atencion.servicios.length === 0 && atencion.id) {
        await cargarServiciosDeAtencion(nuevoIndice)
      }
    })

    onBeforeUnmount(() => {
      mascotaSeleccionadaStore.limpiarMascota()
    })

    return {
      paciente,
      atenciones,
      atencionActual,
      serviciosAplicados,
      atencionActualData,
      serviciosDinamicosParaLista,
      servicioActivoTab,
      guardandoAtencion,
      formatDate,
      navigateCards,
      verDetallesAtencion,
      nuevaAtencion,
      crearNuevaAtencion,
      agregarServicioEnDialogo,
      cargarServiciosDeAtencion,
      actualizarServicio,
      completarServicio,
      eliminarServicio,
      guardarAtencion,
      finalizarAtencion,
      showAddServiceDialog,
      showNuevaAtencionDialog,
      formNuevaAtencion,
      cargandoCatalogos,
      profesionalesOpciones,
      motivosOpciones,
      esquemasActivos,
      catalogosSistemas,
      catalogoServiciosBD,
      imprimirDocumentoServicio,
      imprimirResumenAtencion,
      // Buscador
      showSearchDialog,
      listaPropietariosBusqueda,
      busquedaFormData,
      buscarPacientes,
      limpiarFiltrosBusqueda,
      onMascotaSeleccionada,
      cargandoConfiguracion,
      // Firma
      showFirmaDialog,
      datosFirma,
      firmarServicio,
      procesarGuardadoFirma,
      sidebarCollapsed,
      servicioSeleccionado
    }
  }
}
</script>

<style scoped>
/* ==========================================================================
   ATENCIÓN 2.0 - DESIGN SYSTEM (PREMIUM VETERINARY UI)
   ========================================================================== */

/* Layout & Root */
.fullscreen-atencion {
  height: 100vh;
  width: 100%;
  background: #f1f5f9;
  overflow: hidden;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

.app-shell {
  display: flex;
  height: 100vh;
  width: 100%;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* SIDEBAR LUX */
.atencion-sidebar {
  width: 270px;
  background: white;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  position: relative;
  box-shadow: 4px 0 10px rgba(0,0,0,0.02);
}

.app-shell.is-collapsed .atencion-sidebar {
  width: 80px;
}

.sidebar-header {
  height: 70px;
  border-bottom: 1px solid #f1f5f9;
}

.sidebar-main {
  flex: 1;
  overflow-y: auto;
}

.sidebar-main::-webkit-scrollbar {
  width: 4px;
}

.sidebar-main::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

/* Patient Mini Profile */
.patient-sidebar-profile {
  background: #f8fafc;
  padding: 14px;
  border-radius: 16px;
  border: 1px solid #edf2f7;
  transition: opacity 0.3s;
}

.bg-primary-soft {
  background: rgba(25, 118, 210, 0.08); /* Usando azul primario estandar si no hay variable */
}

/* Nav Buttons */
.nav-btn {
  margin: 4px 10px;
  color: #64748b;
  transition: all 0.2s ease;
  min-height: 44px;
}

.nav-btn:hover {
  background: #f1f5f9;
  color: #1976d2;
}

.nav-active {
  background: rgba(25, 118, 210, 0.1) !important;
  color: #1976d2 !important;
  font-weight: 700 !important;
}

.nav-btn-add {
  border: 2px dashed #e2e8f0;
  margin: 15px 10px;
  transition: all 0.3s ease;
}

.nav-btn-add:hover {
  border-color: #1976d2;
  background: rgba(25, 118, 210, 0.02);
}

/* History Items */
.history-mini-item {
  transition: all 0.2s;
  border: 1px solid transparent;
}

.history-mini-item:hover {
  background: white;
  border-color: #e2e8f0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

/* Workspace Luxe */
.main-workspace {
  flex: 1;
  min-width: 0;
  background: #f1f5f9;
  position: relative;
}

.workspace-header {
  height: 65px;
  display: flex;
  align-items: center;
  z-index: 50;
}

.header-id-badge {
  letter-spacing: 0.5px;
  font-family: 'Inter', sans-serif;
  font-size: 11px;
}

.workspace-viewport {
  padding: 0;
  display: flex;
  flex-direction: column;
}

/* Content Rendering */
.service-view-port {
  border: 1px solid #eef2f5;
  transition: all 0.3s ease;
}

/* Utilities */
.br-md { border-radius: 10px; }
.br-lg { border-radius: 14px; }
.br-xl { border-radius: 20px; }
.br-pill { border-radius: 9999px; }

.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.letter-spacing-1 { letter-spacing: 1px; }

/* Animations */
.animate-fade-in {
  animation: fadeIn 0.35s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .6; }
}

/* Scroll Customizer */
.scroll::-webkit-scrollbar {
  width: 6px;
}
.scroll::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

/* Responsive */
@media (max-width: 900px) {
  .hide-mobile { display: none; }
}

.border-bottom { border-bottom: 1px solid #eef2f5; }
.max-width-1000 { max-width: 1000px; }
</style>
