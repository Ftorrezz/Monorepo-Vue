<template>
  <div class="fullscreen-atencion">
    <div class="app-layout">
      <!-- Sidebar de Atenciones -->
      <div class="attentions-sidebar" :class="{ 'collapsed': sidebarCollapsed }">
        <!-- Header del sidebar -->
        <div class="sidebar-header">
          <div class="sidebar-logo" v-show="!sidebarCollapsed">
            <q-icon name="history" size="28px" color="white" />
            <span class="logo-text">Historial</span>
          </div>
          
          <q-btn
            flat
            round
            :icon="sidebarCollapsed ? 'menu' : 'menu_open'"
            color="white"
            size="sm"
            @click="sidebarCollapsed = !sidebarCollapsed"
            class="toggle-btn"
          />
        </div>

        <!-- Lista de atenciones -->
        <div class="attentions-list">
          <div class="sidebar-action-container q-pa-md" v-show="!sidebarCollapsed">
            <q-btn
              color="white"
              text-color="primary"
              icon="add"
              label="Nueva Atención"
              class="full-width"
              no-caps
              rounded
              unelevated
              @click="nuevaAtencion"
              style="font-weight: 700; height: 48px;"
            />
          </div>
          <div class="attentions-header" v-show="!sidebarCollapsed">
            <span class="attentions-title">Atenciones</span>
            <q-badge color="white" text-color="primary" :label="atenciones.length" />
          </div>

          <div class="attentions-items">
            <div
              v-for="(atencion, index) in atenciones"
              :key="atencion.id"
              class="attention-item-sidebar"
              :class="{ 
                'active': atencionActual === index,
                'collapsed': sidebarCollapsed,
                'in-progress': atencion.estado === 'En curso'
              }"
              @click="atencionActual = index"
            >
              <div class="attention-icon-container">
                <q-avatar 
                  :color="atencionActual === index ? 'white' : (atencion.estado === 'En curso' ? 'orange' : 'green')" 
                  :text-color="atencionActual === index ? (atencion.estado === 'En curso' ? 'orange' : 'green') : 'white'"
                  size="40px"
                  class="attention-avatar"
                >
                  <q-icon :name="atencion.estado === 'En curso' ? 'play_circle' : 'check_circle'" size="20px" />
                </q-avatar>
                
                <div 
                  v-if="atencionActual === index" 
                  class="active-indicator"
                ></div>
              </div>

              <div class="attention-content" v-show="!sidebarCollapsed">
                <div class="attention-number-sidebar">{{ atencion.numero }}</div>
                <div class="attention-date-sidebar">{{ formatDate(atencion.fecha) }} • {{ atencion.hora }}</div>
              </div>

              <q-tooltip 
                v-if="sidebarCollapsed" 
                anchor="center right" 
                self="center left"
                :offset="[10, 0]"
                class="attention-tooltip"
              >
                <div class="tooltip-content">
                  <div class="tooltip-title">{{ atencion.numero }}</div>
                  <div class="tooltip-details">
                    <div>{{ atencion.fecha }}</div>
                    <div>{{ atencion.veterinario }}</div>
                  </div>
                </div>
              </q-tooltip>
            </div>
          </div>
        </div>
      </div>

      <!-- Contenido principal -->
      <div class="main-content" :class="{ 'expanded': sidebarCollapsed }">
        <!-- Header principal -->
        <div class="main-header">
          <div class="header-left">
            <div class="header-info-container" v-if="paciente">
              <!-- Bloque Mascota -->
              <div class="info-group pet-group">
                <div class="info-icon">
                  <q-icon name="pets" size="32px" color="primary" />
                </div>
                <div class="info-content">
                  <div class="info-title">{{ paciente.nombre }}</div>
                  <div class="info-subtitle">
                    <span v-if="paciente.especie">{{ paciente.especie }}</span>
                    <span v-if="paciente.raza" class="q-ml-xs">| {{ paciente.raza }}</span>
                    <span v-if="paciente.edad" class="q-ml-xs">| {{ paciente.edad }} años</span>
                    <span v-if="paciente.peso" class="q-ml-xs">| {{ paciente.peso }} kg</span>
                    <span v-if="!paciente.especie && !paciente.raza && !paciente.edad && !paciente.peso" class="text-grey-5">Sin detalles registrados</span>
                  </div>
                </div>
              </div>

              <div class="info-separator"></div>

              <!-- Bloque Propietario -->
              <div class="info-group" v-if="paciente.propietario">
                <div class="info-icon">
                  <q-avatar size="38px" color="blue-1" text-color="primary">
                    <q-icon name="person" size="24px" />
                  </q-avatar>
                </div>
                <div class="info-content">
                  <div class="info-label">PROPIETARIO</div>
                  <div class="info-value">
                    {{ paciente.propietario.nombre }} 
                    {{ paciente.propietario.primerapellido }} 
                    {{ paciente.propietario.segundoapellido }}
                  </div>
                  <div class="info-subtext" v-if="paciente.propietario.telefono1">
                    <q-icon name="phone" size="14px" /> {{ paciente.propietario.telefono1 }}
                  </div>
                </div>
              </div>

              <div class="info-separator"></div>

              <!-- Bloque Atención -->
              <div class="info-group">
                <div class="info-content">
                  <div class="info-label">IDENTIFICADOR DE ATENCIÓN</div>
                  <div class="info-value accent-text">{{ atenciones[atencionActual].numero }}</div>
                  <div class="info-subtext">
                    <q-icon name="event" size="14px" /> {{ formatDate(atenciones[atencionActual].fecha) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="header-actions">
            <q-btn
              color="secondary"
              icon="print"
              label="Imprimir Resumen"
              @click="imprimirResumenAtencion"
              no-caps
              flat
              dense
              class="q-mr-sm"
            />


            <q-btn
              color="info"
              icon="visibility"
              label="Detalles"
              @click="verDetallesAtencion"
              no-caps
              flat
              dense
            />

            <q-btn
              color="primary"
              icon="add_circle"
              label="Servicio"
              @click="showAddServiceDialog = true"
              :disable="atenciones[atencionActual].estado === 'Finalizada'"
              no-caps
              unelevated
              rounded
            />
          </div>
        </div>

        <div class="content-scroll-area">
          <!-- Banner de estado -->
          <div class="status-banner q-pa-md" :class="atenciones[atencionActual].estado === 'En curso' ? 'in-progress' : 'completed'">
            <div class="row items-center justify-between no-wrap">
              <div class="row items-center q-gutter-md">
                <q-icon :name="atenciones[atencionActual].estado === 'En curso' ? 'pending' : 'verified'" size="32px" />
                <div>
                  <div class="status-label">Estado de la Atención</div>
                  <div class="status-value">{{ atenciones[atencionActual].estado }}</div>
                </div>
                <q-separator vertical dark inset class="q-mx-md opacity-2" />
                <div>
                  <div class="status-label">Veterinario Asignado</div>
                  <div class="status-value">{{ atenciones[atencionActual].veterinario }}</div>
                </div>
              </div>
              <div class="row items-center q-gutter-sm">
                <q-chip outline color="white" text-color="white" icon="event">
                  {{ atenciones[atencionActual].fecha }}
                </q-chip>
                <q-chip outline color="white" text-color="white" icon="schedule">
                  {{ atenciones[atencionActual].hora }}
                </q-chip>
              </div>
            </div>
          </div>

          <!-- Pestañas de servicios aplicados -->
          <div class="services-container">
            <q-card class="services-card">
              <q-card-section class="q-pa-none">
                <div v-if="serviciosAplicados.length === 0" class="empty-services">
                  <div class="text-center q-py-xl text-grey-6" style="height: 300px; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                    <q-icon name="info" size="xl" class="q-mb-md" />
                    <div class="text-h6">No se han aplicado servicios aún</div>
                    <div class="text-subtitle2">Usa el botón "Agregar Servicio" para añadir servicios</div>
                  </div>
                </div>

                <div v-else>
                  <!-- Pestañas de servicios modernas -->
                  <q-tabs
                    v-model="servicioActivoTab"
                    dense
                    class="modern-tabs"
                    active-color="primary"
                    indicator-color="primary"
                    align="left"
                    narrow-indicator
                  >
                    <!-- Pestaña de Resumen Automática -->
                    <q-tab
                      name="resumen"
                      icon="dashboard"
                      label="Resumen de Atención"
                      class="modern-tab resumen-tab"
                    />

                    <q-tab
                      v-for="servicio in serviciosAplicados"
                      :key="servicio.id"
                      :name="servicio.id"
                      :icon="servicio.icono"
                      :label="servicio.nombre"
                      class="modern-tab"
                      :class="{ 'tab-completed': servicio.completado }"
                    >
                      <q-badge
                        v-if="servicio.completado"
                        floating
                        color="positive"
                        rounded
                        class="completion-badge"
                      >
                        <q-icon name="check" size="10px" />
                      </q-badge>
                    </q-tab>
                  </q-tabs>

                  <q-separator />

                  <!-- Contenido de las pestañas -->
                   <q-tab-panels
                    v-model="servicioActivoTab"
                    animated
                    swipeable
                    class="modern-tab-panels"
                  >
                    <!-- Panel de Resumen -->
                    <q-tab-panel name="resumen" class="q-pa-md">
                      <ServicioResumen 
                        :servicios-aplicados="serviciosAplicados"
                        @seleccionar-pestaña="servicioActivoTab = $event"
                        @imprimir-servicio="imprimirDocumentoServicio"
                      />
                    </q-tab-panel>

                    <q-tab-panel
                      v-for="servicio in serviciosAplicados"
                      :key="servicio.id"
                      :name="servicio.id"
                      class="q-pa-md"
                    >
                      <!-- 1. Componente Dinámico (EAV/Metadata PoC) - Prioridad Alta -->
                      <ServicioDinamico
                        v-if="esquemasActivos[servicio.tipo]"
                        :schema="esquemasActivos[servicio.tipo]"
                        :servicio-id="servicio.id"
                        :atencion-id="String(atenciones[atencionActual].id)"
                        :datos-iniciales="servicio.datos"
                        :modo-lectura="servicio.completado || atenciones[atencionActual].estado === 'Finalizada'"
                        :catalogos="catalogosSistemas"
                        @servicio-actualizado="actualizarServicio"
                        @servicio-completado="completarServicio"
                        @servicio-eliminado="eliminarServicio"
                      />

                      <!-- 2. Componentes Especializados Hardcoded -->
                      <ServicioVacunacion
                        v-else-if="servicio.tipo === 'vacunacion'"
                        :servicio-id="servicio.id"
                        :atencion-id="String(atenciones[atencionActual].id)"
                        :datos-iniciales="servicio.datos"
                        :modo-lectura="servicio.completado || atenciones[atencionActual].estado === 'Finalizada'"
                        @servicio-actualizado="actualizarServicio"
                        @servicio-completado="completarServicio"
                        @servicio-eliminado="eliminarServicio"
                      />

                      <!-- Componente de Desparacitación -->
                      <ServicioDesparacitacion
                        v-else-if="servicio.tipo === 'desparacitacion'"
                        :servicio-id="servicio.id"
                        :atencion-id="String(atenciones[atencionActual].id)"
                        :datos-iniciales="servicio.datos"
                        :modo-lectura="servicio.completado || atenciones[atencionActual].estado === 'Finalizada'"
                        @servicio-actualizado="actualizarServicio"
                        @servicio-completado="completarServicio"
                        @servicio-eliminado="eliminarServicio"
                      />
                      <!-- Componente de Laboratorio -->
                      <OrdenLaboratorio
                        v-else-if="servicio.tipo === 'laboratorio'"
                        :servicio-id="servicio.id"
                        :atencion-id="String(atenciones[atencionActual].id)"
                        :datos-iniciales="servicio.datos"
                        :modo-lectura="servicio.completado || atenciones[atencionActual].estado === 'Finalizada'"
                        @servicio-actualizado="actualizarServicio"
                        @servicio-completado="completarServicio"
                        @servicio-eliminado="eliminarServicio"  
                      />
                      <!-- Componente de Rayos X -->
                      <ServicioRayosX
                        v-else-if="servicio.tipo === 'rayosx'"
                        :servicio-id="servicio.id"
                        :atencion-id="String(atenciones[atencionActual].id)"
                        :datos-iniciales="servicio.datos"
                        :modo-lectura="servicio.completado || atenciones[atencionActual].estado === 'Finalizada'"
                        @servicio-actualizado="actualizarServicio"
                        @servicio-completado="completarServicio"
                        @servicio-eliminado="eliminarServicio"  
                      />
                      <ServicioUltrasonido
                        v-else-if="servicio.tipo === 'ultrasonido'"
                        :servicio-id="servicio.id"
                        :atencion-id="String(atenciones[atencionActual].id)"
                        :datos-iniciales="servicio.datos"
                        :modo-lectura="servicio.completado || atenciones[atencionActual].estado === 'Finalizada'"
                        @servicio-actualizado="actualizarServicio"
                        @servicio-completado="completarServicio"
                        @servicio-eliminado="eliminarServicio"  
                      />
                      <ServicioExploracionFisica
                        v-else-if="servicio.tipo === 'exploracion'"
                        :servicio-id="servicio.id"
                        :atencion-id="String(atenciones[atencionActual].id)"
                        :datos-iniciales="servicio.datos"
                        :modo-lectura="servicio.completado || atenciones[atencionActual].estado === 'Finalizada'"
                        @servicio-actualizado="actualizarServicio"
                        @servicio-completado="completarServicio"
                        @servicio-eliminado="eliminarServicio"
                      />
                      <ServicioHospitalizacion
                        v-else-if="servicio.tipo === 'hospitalizacion'"
                        :servicio-id="servicio.id"
                        :atencion-id="String(atenciones[atencionActual].id)"
                        :datos-iniciales="servicio.datos"
                        :modo-lectura="servicio.completado || atenciones[atencionActual].estado === 'Finalizada'"
                        @servicio-actualizado="actualizarServicio"
                        @servicio-completado="completarServicio"
                        @servicio-eliminado="eliminarServicio"
                      />
                      <ServicioMedicamento
                        v-else-if="servicio.tipo === 'medicamentos'"
                        :servicio-id="servicio.id"
                        :atencion-id="String(atenciones[atencionActual].id)"
                        :datos-iniciales="servicio.datos"
                        :modo-lectura="servicio.completado || atenciones[atencionActual].estado === 'Finalizada'"
                        @servicio-actualizado="actualizarServicio"
                        @servicio-completado="completarServicio"
                        @servicio-eliminado="eliminarServicio"
                      />
                      <ServicioFisioterapia
                        v-else-if="servicio.tipo === 'rehabilitacion'"
                        :servicio-id="servicio.id"
                        :atencion-id="String(atenciones[atencionActual].id)"
                        :datos-iniciales="servicio.datos"
                        :modo-lectura="servicio.completado || atenciones[atencionActual].estado === 'Finalizada'"
                        @servicio-actualizado="actualizarServicio"
                        @servicio-completado="completarServicio"
                        @servicio-eliminado="eliminarServicio"
                      />
                      <ServicioUrgencia
                        v-else-if="servicio.tipo === 'emergencia'"
                        :servicio-id="servicio.id"
                        :atencion-id="String(atenciones[atencionActual].id)"
                        :datos-iniciales="servicio.datos"
                        :modo-lectura="servicio.completado || atenciones[atencionActual].estado === 'Finalizada'"
                        @servicio-actualizado="actualizarServicio"
                        @servicio-completado="completarServicio"
                        @servicio-eliminado="eliminarServicio"
                      />
                      <ServicioEstetica
                        v-else-if="servicio.tipo === 'estetica'"
                        :servicio-id="servicio.id"
                        :atencion-id="String(atenciones[atencionActual].id)"
                        :datos-iniciales="servicio.datos"
                        :modo-lectura="servicio.completado || atenciones[atencionActual].estado === 'Finalizada'"
                        @servicio-actualizado="actualizarServicio"
                        @servicio-completado="completarServicio"
                        @servicio-eliminado="eliminarServicio"
                      />
                      
                      <!-- Componente genérico para servicios no implementados -->
                      <div v-else class="generic-service">
                        <div class="generic-service-content">
                          <q-avatar size="64px" :color="servicio.color" class="q-mb-md">
                            <q-icon :name="servicio.icono" size="32px" color="white" />
                          </q-avatar>
                          <div class="service-name">{{ servicio.nombre }}</div>
                          <div class="service-status">En desarrollo...</div>
                          <div class="service-timestamp">{{ servicio.timestamp }}</div>
                          <q-btn
                            flat
                            color="negative"
                            icon="delete"
                            label="Eliminar"
                            @click="eliminarServicio(servicio.id)"
                            class="q-mt-md"
                          />
                        </div>
                      </div>
                    </q-tab-panel>
                  </q-tab-panels>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </div>

    <!-- Dialog para Nueva Atención -->
    <q-dialog v-model="showNuevaAtencionDialog" persistent>
      <q-card style="min-width: 500px; max-width: 600px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Nueva Atención</div>
          <div class="text-caption">Ingrese los datos principales de la atención</div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-select
            v-model="formNuevaAtencion.veterinario_id"
            :options="profesionalesOpciones"
            label="Veterinario Asignado *"
            outlined
            dense
            emit-value
            map-options
            :rules="[val => !!val || 'Campo obligatorio']"
          >
            <template v-slot:prepend>
              <q-icon name="person" />
            </template>
          </q-select>

          <q-select
            v-model="formNuevaAtencion.motivo_id"
            :options="motivosOpciones"
            label="Motivo de la Atención *"
            outlined
            dense
            emit-value
            map-options
            :rules="[val => !!val || 'Campo obligatorio']"
          >
            <template v-slot:prepend>
              <q-icon name="event_note" />
            </template>
          </q-select>

          <q-input
            v-model="formNuevaAtencion.observaciones"
            label="Observaciones Iniciales"
            type="textarea"
            rows="3"
            outlined
            dense
            placeholder="Detalles adicionales (opcional)"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey-7" @click="showNuevaAtencionDialog = false" />
          <q-btn 
            unelevated 
            label="Crear Atención" 
            color="primary" 
            @click="crearNuevaAtencion"
            :disable="!formNuevaAtencion.veterinario_id || !formNuevaAtencion.motivo_id"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialogo para agregar servicios -->
    <q-dialog 
      v-model="showAddServiceDialog" 
      persistent 
      :maximized="$q.screen.lt.md"
      class="servicios-dialog"
    >
      <div class="dialog-content q-pa-lg bg-white">
        <ServiciosDisponibles
          :servicios-aplicados="serviciosAplicados"
          :atencion-finalizada="atenciones[atencionActual].estado === 'Finalizada'"
          @agregar-servicio="agregarServicioEnDialogo"
          @close="showAddServiceDialog = false"
        />
      </div>
    </q-dialog>

    <!-- Botones de acción flotantes modernos -->
    <q-page-sticky position="bottom-right" :offset="[20, 20]">
      <div class="floating-actions">
        <q-btn
          fab
          icon="save"
          color="primary"
          @click="guardarAtencion"
          :loading="guardandoAtencion"
          class="action-btn"
          size="lg"
        >
          <q-tooltip anchor="center left" self="center right">Guardar Atención</q-tooltip>
        </q-btn>
        <q-btn
          fab
          icon="check_circle"
          color="positive"
          @click="finalizarAtencion"
          class="action-btn q-ml-sm"
          size="lg"
        >
          <q-tooltip anchor="center left" self="center right">Finalizar Atención</q-tooltip>
        </q-btn>
      </div>
    </q-page-sticky>
  </div>
</template>

<script>
import { ref, computed, onBeforeUnmount, watch, reactive, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useMascotaSeleccionadaStore } from 'src/stores/mascotaSeleccionadaStore';
import { usePlantillas } from 'src/composables/usePlantillas'
import { servicioDinamicoService } from 'src/services/servicioDinamico.service'
import { profesionalService } from 'src/services/profesional.service'
import { citaMotivoService } from 'src/services/citaMotivo.service'

// Importación de los componentes de servicios
import ServicioVacunacion from '../components/servicios/ServicioVacunacion.vue'
import ServicioDesparacitacion from '../components/servicios/ServicioDesparacitacion.vue'
import ServiciosDisponibles from '../components/servicios/ServiciosDisponibles.vue'
import OrdenLaboratorio from '../components/laboratorio/OrdenLaboratorio.vue';
import ServicioRayosX from '../components/servicios/ServicioRayosX.vue';
import ServicioUltrasonido from 'src/components/servicios/ServicioUltrasonido.vue';
import ServicioExploracionFisica from 'src/components/servicios/ServicioExploracionFisica.vue';
import ServicioHospitalizacion from 'src/components/servicios/ServicioHospitalizacion.vue';
import ServicioMedicamento from 'src/components/servicios/ServicioMedicamento.vue';
import ServicioFisioterapia from 'src/components/servicios/ServicioFisioterapia.vue';
import ServicioUrgencia from 'src/components/servicios/ServicioUrgencia.vue';
 import ServicioEstetica from '../components/servicios/ServicioEstetica.vue'
import ServicioResumen from '../components/servicios/ServicioResumen.vue'
import ServicioDinamico from '../components/servicios/ServicioDinamico.vue'

export default {
  name: 'AtencionPaciente',
  components: {
    ServicioVacunacion,
    ServicioDesparacitacion,
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
    ServicioResumen,
    ServicioDinamico
  },
  setup() {
    const $q = useQuasar()
    const mascotaSeleccionadaStore = useMascotaSeleccionadaStore()

    // Estados reactivos
    const sidebarCollapsed = ref(false)
    const guardandoAtencion = ref(false)
    const servicioActivoTab = ref(null)
    const showAddServiceDialog = ref(false)
    const showNuevaAtencionDialog = ref(false)
    
    // Formulario para nueva atención
    const formNuevaAtencion = reactive({
      veterinario_id: null,
      motivo_id: null,
      observaciones: ''
    })

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

    // Esquemas para servicios dinámicos (se cargan de BD)
    const esquemasActivos = ref({})
    
    // Estados para catálogos
    const profesionalesDisponibles = ref([])
    const motivosDisponibles = ref([])

    // Datos del paciente (ahora vienen del store)
    const paciente = computed(() => mascotaSeleccionadaStore.mascota || {
      id: '', nombre: '', especie: '', raza: '', edad: '', peso: '', propietario: '', telefono: ''
    })

    // Computed para opciones de selects
    const profesionalesOpciones = computed(() => {
      return profesionalesDisponibles.value.map(p => ({
        label: `${p.nombre} ${p.primerapellido || ''} ${p.segundoapellido || ''}`.trim(),
        value: p.id
      }))
    })

    const motivosOpciones = computed(() => {
      return motivosDisponibles.value.map(m => ({
        label: m.nombre,
        value: m.id
      }))
    })

    // Lista de atenciones del paciente
    const atenciones = ref([
      {
         id: 'at_001',
        numero: 'A-2024-001',
        fecha: '2024-01-15',
        hora: '10:30',
        fechaFinalizacion: '',
        horaFinalizacion: '',
        veterinario: 'Dr. Carlos Mendoza',
        estado: 'En curso',
        servicios: []
      },
      {
         id: 'at_002',
        numero: 'A-2024-002',
        fecha: '2024-01-10',
        hora: '09:15',
        fechaFinalizacion: '2024-01-10',
        horaFinalizacion: '10:00',
        veterinario: 'Dr. Ana Ruiz',
        estado: 'Finalizada',
        servicios: [
          {
            id: 'vac_001',
            tipo: 'vacunacion',
            nombre: 'Vacunación',
            icono: 'vaccines',
            color: 'green',
            completado: true,
            timestamp: '2024-01-10 09:30',
            datos: { vacuna: 'Rabia', laboratorio: 'MSD', lote: 'L123' }
          },
          {
            id: 'exp_001',
            tipo: 'exploracion',
            nombre: 'Exploración Física',
            icono: 'health_and_safety',
            color: 'blue',
            completado: true,
            timestamp: '2024-01-10 09:20',
            datos: { temperatura: '38.5', peso: '25.3' }
          }
        ]
      },
      {
         id: 'at_003',
        numero: 'A-2024-003',
        fecha: '2024-01-05',
        hora: '11:45',
        fechaFinalizacion: '2024-01-05',
        horaFinalizacion: '12:20',
        veterinario: 'Dr. Carlos Mendoza',
        estado: 'Finalizada',
        servicios: [
          {
            id: 'des_001',
            tipo: 'desparacitacion',
            nombre: 'Desparacitación',
            icono: 'medication',
            color: 'orange',
            completado: true,
            timestamp: '2024-01-05 12:00',
            datos: { producto: 'Drontal', dosis: '2 ml' }
          }
        ]
      }
    ])

    // Atención actual seleccionada
    const atencionActual = ref(0)

    // Servicios aplicados en esta atención
    const serviciosAplicados = computed(() => {
      return atenciones.value[atencionActual.value]?.servicios || []
    })

     // Watcher para actualizar la pestaña activa cuando cambien los servicios
    watch(serviciosAplicados, (nuevosServicios) => {
      if (nuevosServicios.length > 0 && !servicioActivoTab.value) {
        servicioActivoTab.value = 'resumen'
      } else if (nuevosServicios.length === 0) {
        servicioActivoTab.value = null
      }
    }, { immediate: true, deep: true })

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

    const nuevaAtencion = () => {
      // Resetear formulario
      formNuevaAtencion.veterinario_id = null
      formNuevaAtencion.motivo_id = null
      formNuevaAtencion.observaciones = ''
      
      // Abrir diálogo
      showNuevaAtencionDialog.value = true
    }

    const crearNuevaAtencion = () => {
      const fecha = new Date()
      const numeroAtencion = `A-${fecha.getFullYear()}-${String(atenciones.value.length + 1).padStart(3, '0')}`
      
      const veterinarioObj = profesionalesDisponibles.value.find(p => p.id === formNuevaAtencion.veterinario_id)
      const motivoObj = motivosDisponibles.value.find(m => m.id === formNuevaAtencion.motivo_id)

      const nuevaAtencionData = {
        id: `at_${Date.now()}`,
        numero: numeroAtencion,
        fecha: fecha.toISOString().split('T')[0],
        hora: fecha.toTimeString().split(' ')[0].substring(0, 5),
        veterinario: veterinarioObj ? `${veterinarioObj.nombre} ${veterinarioObj.primerapellido || ''}`.trim() : 'Sin asignar',
        veterinario_id: formNuevaAtencion.veterinario_id,
        motivo: motivoObj?.nombre || '',
        motivo_id: formNuevaAtencion.motivo_id,
        observaciones: formNuevaAtencion.observaciones,
        estado: 'En curso',
        servicios: []
      }

      atenciones.value.unshift(nuevaAtencionData)
      atencionActual.value = 0

      $q.notify({
        type: 'positive',
        message: 'Nueva atención creada',
        position: 'top-right'
      })
      
      showNuevaAtencionDialog.value = false
    }

    const mostrarAtenciones = () => {
      $q.dialog({
        title: 'Historial de Atenciones',
        message: `Este paciente tiene ${atenciones.value.length} atenciones registradas. Haga clic en cualquier tarjeta para seleccionarla.`,
        ok: 'Entendido'
      })
    }

    const agregarServicioEnDialogo = (servicio) => {
      if (atenciones.value[atencionActual.value].estado === 'Finalizada') {
        $q.notify({
          type: 'negative',
          message: 'No se pueden agregar servicios a una atención finalizada',
          position: 'top-right'
        })
        return
      }

      const serviciosActuales = atenciones.value[atencionActual.value].servicios
      const yaExiste = serviciosActuales.some(s => s.tipo === servicio.tipo)

      if (yaExiste) {
        $q.notify({
          type: 'negative',
          message: `El servicio "${servicio.nombre}" ya ha sido agregado a esta atención`,
          position: 'top-right',
          timeout: 3000
        })
        return
      }

      const nuevoServicio = {
        id: `${servicio.tipo}_${Date.now()}`,
        tipo: servicio.tipo,
        nombre: servicio.nombre,
        icono: servicio.icono,
        color: servicio.color,
        completado: false,
        timestamp: new Date().toLocaleString(),
        datos: {}
      }

      serviciosActuales.push(nuevoServicio)
      servicioActivoTab.value = nuevoServicio.id

      $q.notify({
        type: 'positive',
        message: `${servicio.nombre} agregado exitosamente`,
        position: 'top-right',
        icon: servicio.icono,
        timeout: 2500
      })
      showAddServiceDialog.value = false
    }

    const actualizarServicio = (servicioId, nuevosDatos) => {
      const servicio = serviciosAplicados.value.find(s => s.id === servicioId)
      if (servicio) {
        servicio.datos = { ...servicio.datos, ...nuevosDatos }
      }
    }

    const completarServicio = (servicioId, datosFinales = {}) => {
      const servicio = serviciosAplicados.value.find(s => s.id === servicioId)
      if (servicio) {
        servicio.completado = true
        servicio.datos = { ...servicio.datos, ...datosFinales }

        $q.notify({
          type: 'positive',
          message: `${servicio.nombre} completado exitosamente`,
          position: 'top-right',
          timeout: 2000,
          icon: 'check_circle'
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
      }).onOk(() => {
        const servicios = atenciones.value[atencionActual.value].servicios
        const index = servicios.findIndex(s => s.id === servicioId)
        if (index > -1) {
          servicios.splice(index, 1)
          
           if (servicioActivoTab.value === servicioId) {
            if (servicios.length > 0) {
              servicioActivoTab.value = 'resumen'
            } else {
              servicioActivoTab.value = null
            }
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
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        $q.notify({
          type: 'positive',
          message: 'Atención guardada correctamente',
          position: 'top-right',
          icon: 'save'
        })

        console.log('Guardando atención:', atenciones.value[atencionActual.value])
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
      }).onOk(() => {
        const atencion = atenciones.value[atencionActual.value]
        atencion.estado = 'Finalizada'
        atencion.fechaFinalizacion = new Date().toISOString().split('T')[0]
        atencion.horaFinalizacion = new Date().toTimeString().split(' ')[0].substring(0, 5)

        $q.notify({
          type: 'positive',
          message: 'Atención finalizada correctamente',
          position: 'top-right',
          icon: 'check_circle'
        })
      })
    }

    const { cargarPlantillaPorId, cargarPlantillaPorCodigo, procesarHtml, generarPDF } = usePlantillas()

    const imprimirDocumentoServicio = async (servicio) => {
      // Intentar obtener id_plantilla de la configuración del servicio
      const idPlantilla = servicio.id_plantilla || (esquemasActivos[servicio.tipo]?.id_plantilla)
      
      if (!idPlantilla) {
        $q.notify({ type: 'warning', message: 'Este servicio no tiene una plantilla asociada' })
        return
      }

      $q.loading.show({ message: 'Preparando documento...' })
      try {
        const plantilla = await cargarPlantillaPorId(idPlantilla)
        if (!plantilla) throw new Error('Plantilla no encontrada')

        const datosVariables = {
          ...servicio.datos,
          paciente_nombre: paciente.value.nombre,
          propietario_nombre: paciente.value.propietario?.nombre,
          fecha_atencion: atenciones.value[atencionActual.value].fecha,
          atencion_numero: atenciones.value[atencionActual.value].numero
        }

        const html = procesarHtml(plantilla.contenido_html, datosVariables)
        await generarPDF(html, { 
          filename: `${servicio.nombre}_${paciente.value.nombre}.pdf`,
          paperSize: plantilla.tamano_papel,
          orientation: plantilla.orientacion
        })
      } catch (error) {
        console.error(error)
        $q.notify({ type: 'negative', message: 'Error al generar documento' })
      } finally {
        $q.loading.hide()
      }
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

    // Cargar catálogos y esquemas dinámicos al montar
    onMounted(async () => {
      try {
        // Cargar profesionales
        const profs = await profesionalService.getProfesionales()
        profesionalesDisponibles.value = profs
        
        //Actualizar catálogo global
        catalogosSistemas.VETERINARIOS = profs.map(p => ({
          label: `${p.nombre} ${p.primerapellido || ''}`.trim(),
          value: p.id
        }))
        
        // Cargar motivos
        const motivos = await citaMotivoService.getMotivos()
        motivosDisponibles.value = motivos
        
        // Cargar servicios dinámicos
        const serviciosDinamicos = await servicioDinamicoService.getServicios()
        
        // Cargar esquemas para servicios activos
        for (const srv of serviciosDinamicos.filter(s => s.activo === 'S')) {
          const esquema = await servicioDinamicoService.getEsquemaServicio(srv.id)
          if (esquema && esquema.identificador) {
            esquemasActivos.value[esquema.identificador] = esquema
          }
        }
      } catch (error) {
        console.error('Error al cargar catálogos:', error)
        $q.notify({ type: 'warning', message: 'Algunos catálogos no se pudieron cargar' })
      }
    })

    onBeforeUnmount(() => {
      mascotaSeleccionadaStore.limpiarMascota()
    })

    return {
      sidebarCollapsed,
      paciente,
      atenciones,
      atencionActual,
      serviciosAplicados,
      servicioActivoTab,
      guardandoAtencion,
      formatDate,
      navigateCards,
      verDetallesAtencion,
      nuevaAtencion,
      crearNuevaAtencion,
      mostrarAtenciones,
      agregarServicioEnDialogo, 
      actualizarServicio,
      completarServicio,
      eliminarServicio,
      guardarAtencion,
      finalizarAtencion,
      showAddServiceDialog,
      showNuevaAtencionDialog,
      formNuevaAtencion,
      profesionalesOpciones,
      motivosOpciones,
      esquemasActivos,
      catalogosSistemas,
      imprimirDocumentoServicio,
      imprimirResumenAtencion
    }
  }
}
</script>

<style scoped>
/* Layout principal */
.fullscreen-atencion {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  font-family: 'Inter', sans-serif;
}

.app-layout {
  display: flex;
  min-height: 100vh;
}

/* Sidebar de Atenciones */
.attentions-sidebar {
  width: 300px;
  background: linear-gradient(180deg, #1976D2 0%, #711bc8 100%);
  color: white;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  box-shadow: 2px 0 20px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1000;
}

.attentions-sidebar.collapsed {
  width: 80px;
}

.sidebar-header {
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  min-height: 80px;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.attentions-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.attentions-header {
  padding: 20px 20px 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.attentions-title {
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.9;
}

.attentions-items {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.attention-item-sidebar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  border-radius: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  background: rgba(255, 255, 255, 0.05);
}

.attention-item-sidebar:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateX(4px);
}

.attention-item-sidebar.active {
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transform: translateX(4px);
}

.attention-item-sidebar.in-progress:not(.active) {
  border-left: 3px solid #ff9800;
}

.attention-icon-container {
  position: relative;
  flex-shrink: 0;
}

.active-indicator {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  background: #4ade80;
  border: 2px solid white;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(74, 222, 128, 0.4);
}

.attention-content {
  flex: 1;
  min-width: 0;
}

.attention-number-sidebar {
  font-weight: 600;
  font-size: 0.95rem;
}

.attention-date-sidebar {
  font-size: 0.8rem;
  opacity: 0.8;
}

.sidebar-footer {
  padding: 20px;
  background: rgba(0, 0, 0, 0.1);
}

/* Main Content */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.3s ease;
  background: white;
}

.main-header {
  height: 80px;
  padding: 0 30px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #edf2f7;
}

.header-left .breadcrumb {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-info-container {
  display: flex;
  align-items: center;
  gap: 0;
}

.info-group {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 0 25px;
}

.pet-group {
  padding-left: 0;
}

.info-separator {
  width: 1px;
  height: 40px;
  background: #e2e8f0;
}

.info-content {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: 10px;
  font-weight: 800;
  color: #a0aec0;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 2px;
}

.info-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1a202c;
  line-height: 1;
}

.info-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #2d3748;
  line-height: 1.2;
}

.info-value.accent-text {
  color: #1976D2;
}

.info-subtitle {
  font-size: 0.9rem;
  font-weight: 500;
  color: #718096;
  margin-top: 4px;
}

.info-subtext {
  font-size: 0.85rem;
  font-weight: 600;
  color: #4a5568;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
}

.sidebar-action-container {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Status Banner */
.status-banner {
  margin: 20px;
  border-radius: 16px;
  color: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.status-banner.in-progress {
  background: linear-gradient(135deg, #1976D2 0%, #1565C0 100%);
}

.status-banner.completed {
  background: linear-gradient(135deg, #43a047 0%, #2e7d32 100%);
}

.status-label {
  font-size: 0.75rem;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-value {
  font-size: 1.1rem;
  font-weight: 700;
}

.opacity-2 {
  opacity: 0.2;
}

/* Services Area */
.content-scroll-area {
  flex: 1;
  overflow-y: auto;
  background: #f7fafc;
}

.services-container {
  width: 100%;
  padding: 0 20px 20px 20px;
}

.services-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: none;
  overflow: hidden;
  background: white;
}

.modern-tabs {
  background: white;
  padding: 10px 10px 0 10px;
}

.modern-tab {
  border-radius: 12px 12px 0 0;
  transition: all 0.3s ease;
  min-height: 50px;
}

.tab-completed {
  color: #43a047;
}

.modern-tab-panels {
  min-height: 500px;
}

/* Empty State */
.empty-services {
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Floating Actions */
.floating-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-4px);
}

/* Responsive */
@media (max-width: 1024px) {
  .header-patient-details {
    display: none;
  }
}

@media (max-width: 768px) {
  .attentions-sidebar {
    position: absolute;
    height: 100%;
    left: 0;
  }
  
  .attentions-sidebar.collapsed {
    width: 0;
    overflow: hidden;
  }
}

/* Estilos para el diálogo de servicios */
.servicios-dialog .q-dialog__inner > div {
  width: 95vw;
  max-width: 1200px;
  min-width: 800px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.dialog-content {
  max-height: 85vh;
  overflow-y: auto;
}

</style>
