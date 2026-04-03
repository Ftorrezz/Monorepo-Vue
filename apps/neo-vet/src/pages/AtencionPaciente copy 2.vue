<template>
  <div class="fullscreen-atencion">
    <div class="app-column-layout">
      <!-- Cabecera Premium Rediseñada -->
      <div class="main-header-premium">
        <div class="header-profile-section" v-if="paciente && paciente.id">
          <!-- Bloque Paciente -->
          <div class="patient-profile-card shadow-sm">
            <div class="profile-avatar bg-primary-soft">
              <q-icon name="pets" size="32px" color="primary" />
            </div>
            <div class="profile-details">
              <div class="patient-name-container">
                <h1 class="patient-name text-weight-bolder">{{ paciente.nombre }}</h1>
                <q-badge rounded color="primary" class="q-ml-sm text-weight-bold" outline v-if="paciente.especie">
                  {{ paciente.especie }}
                </q-badge>
              </div>
              <div class="patient-brief row items-center no-wrap">
                <span class="brief-item" v-if="paciente.raza">{{ paciente.raza }}</span>
                <q-separator vertical class="q-mx-sm" v-if="paciente.edad" />
                <span class="brief-item" v-if="paciente.edad">{{ paciente.edad }} años</span>
                <q-separator vertical class="q-mx-sm" v-if="paciente.peso" />
                <span class="brief-item" v-if="paciente.peso">{{ paciente.peso }} kg</span>
              </div>
            </div>
          </div>

          <div class="header-v-divider"></div>

          <!-- Bloque Propietario -->
          <div class="owner-profile-card" v-if="paciente.propietario">
            <div class="row items-center no-wrap">
              <q-avatar size="44px" class="q-mr-md shadow-1 bg-blue-1">
                <q-icon name="person" size="28px" color="primary" />
              </q-avatar>
              <div class="owner-info">
                <div class="label-tiny">PROPIETARIO</div>
                <div class="owner-fullname text-weight-bold">
                  {{ paciente.propietario.nombre }} {{ paciente.propietario.primerapellido }}
                </div>
                <div class="owner-contact text-caption text-grey-7 row items-center no-wrap">
                  <q-icon name="phone" size="14px" class="q-mr-xs" />
                  {{ paciente.propietario.telefono1 || 'Sin teléfono' }}
                </div>
              </div>
            </div>
          </div>

          <div class="header-v-divider"></div>

          <!-- Bloque ID Atención -->
          <div class="attention-id-card">
            <div class="label-tiny">ID ATENCIÓN ACTUAL</div>
            <div class="attention-number text-primary text-weight-black" v-if="atenciones.length > 0">
              {{ atenciones[atencionActual]?.numero }}
            </div>
            <div class="attention-number text-grey-5" v-else>SN-0000</div>
            <div class="text-caption text-grey-6" v-if="atenciones.length > 0">
              {{ formatDate(atenciones[atencionActual]?.fecha) }}
            </div>
          </div>
        </div>

        <div class="header-actions">
           <!-- Botón Nueva Atención movido desde el sidebar -->
           <q-btn
            color="white"
            text-color="primary"
            icon="add"
            label="Nueva Atención"
            @click="nuevaAtencion"
            :disable="!paciente || !paciente.id"
            no-caps
            class="q-mr-sm text-weight-bold"
            style="height: 40px;"
          />

          <q-btn
            color="primary"
            icon="search"
            label="Cambiar Paciente"
            @click="showSearchDialog = true"
            no-caps

            flat
            class="search-btn-premium"
          />
          
          <q-separator vertical class="q-mx-sm" />

          <div class="row q-gutter-sm no-wrap">
            <q-btn 
              round 
              flat 
              color="secondary" 
              icon="print" 
              @click="imprimirResumenAtencion"
            >
              <q-tooltip>Imprimir Resumen</q-tooltip>
            </q-btn>
            <q-btn 
              round 
              flat 
              color="info" 
              icon="info_outline" 
              @click="verDetallesAtencion"
            >
              <q-tooltip>Detalles de Atención</q-tooltip>
            </q-btn>
            <q-btn
              color="primary"
              icon="add"
              label="Nuevo Servicio"
              @click="showAddServiceDialog = true"
              :disable="atenciones.length === 0 || atencionActualData.estado === 'Finalizada'"
              no-caps

              class="add-service-btn animate-pop"
            />
          </div>
        </div>
      </div>

      <!-- Barra de Historial Horizontal (Timeline) -->
      <div class="attentions-timeline-bar" v-if="atenciones.length > 0">
        <div class="timeline-header">
          <q-icon name="history" size="xs" color="grey-7" />
          <span class="text-caption text-weight-bold text-grey-7">HISTORIAL</span>
        </div>
        
        <div class="timeline-scroll-container">
          <div
            v-for="(atencion, index) in atenciones"
            :key="atencion.id"
            class="timeline-item-pill"
            :class="{ 
              'active': atencionActual === index,
              'in-progress': atencion.estado === 'En curso'
            }"
            @click="atencionActual = index"
          >
            <div class="item-indicator" :class="atencion.estado === 'En curso' ? 'bg-orange' : 'bg-green'"></div>
            <div class="item-data">
              <span class="item-number">{{ atencion.numero }}</span>
              <span class="item-date">{{ formatDate(atencion.fecha) }}</span>
            </div>
            <q-tooltip anchor="bottom middle" self="top middle" :offset="[0, 8]">
              {{ atencion.veterinario }} - {{ atencion.estado }}
            </q-tooltip>
          </div>
        </div>
      </div>

      <!-- Overlay de carga inicial -->
      <q-inner-loading :showing="cargandoConfiguracion" class="bg-white" style="z-index: 2000;">
        <q-spinner-cube color="primary" size="80px" />
        <div class="text-h6 q-mt-md text-primary text-weight-bold animate-pulse">
          Configurando entorno médico...
        </div>
        <div class="text-caption text-grey-6">Optimizando servicios y catálogos</div>
      </q-inner-loading>

      <!-- Área de Contenido Central -->
      <div class="content-scroll-area" v-if="atenciones.length > 0">
        <!-- Banner de estado -->
        <div class="status-banner q-pa-md" :class="atencionActualData.estado === 'En curso' ? 'in-progress' : 'completed'">
          <div class="row items-center justify-between no-wrap">
            <div class="row items-center q-gutter-md">
              <q-icon :name="atencionActualData.estado === 'En curso' ? 'pending' : 'verified'" size="32px" />
              <div>
                <div class="status-label">Estado de la Atención</div>
                <div class="status-value">{{ atencionActualData.estado }}</div>
              </div>
              <q-separator vertical dark inset class="q-mx-md opacity-2" />
              <div>
                <div class="status-label">Veterinario Asignado</div>
                <div class="status-value">{{ atencionActualData.veterinario }}</div>
              </div>
            </div>
            <div class="row items-center q-gutter-sm">
              <q-chip outline color="white" text-color="white" icon="event">
                {{ atencionActualData.fecha }}
              </q-chip>
              <q-chip outline color="white" text-color="white" icon="schedule">
                {{ atencionActualData.hora }}
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
                    <!-- 1. Componente Dinámico (EAV/Metadata PoC) -->
                    <ServicioDinamico
                      v-if="esquemasActivos[servicio.tipo]"
                      :schema="esquemasActivos[servicio.tipo]"
                      :servicio-id="servicio.id"
                      :atencion-id="String(atencionActualData.id)"
                      :datos-iniciales="servicio.datos"
                      :modo-lectura="servicio.completado || atencionActualData.estado === 'Finalizada'"
                      :catalogos="catalogosSistemas"
                      @servicio-actualizado="actualizarServicio"
                      @servicio-completado="completarServicio"
                      @servicio-eliminado="eliminarServicio"
                    />

                    <!-- 2. Componentes Especializados -->
                    <ServicioVacunacion
                      v-else-if="servicio.tipo?.toLowerCase() === 'vacunacion'"
                      :servicio-id="servicio.id"
                      :atencion-id="String(atencionActualData.id)"
                      :datos-iniciales="servicio.datos"
                      :modo-lectura="servicio.completado || atencionActualData.estado === 'Finalizada'"
                      @servicio-actualizado="actualizarServicio"
                      @servicio-completado="completarServicio"
                      @servicio-eliminado="eliminarServicio"
                    />

                    <ServicioDesparacitacion
                      v-else-if="servicio.tipo?.toLowerCase() === 'desparacitacion' || servicio.tipo?.toLowerCase() === 'desparasitacion'"
                      :servicio-id="servicio.id"
                      :atencion-id="String(atencionActualData.id)"
                      :datos-iniciales="servicio.datos"
                      :modo-lectura="servicio.completado || atencionActualData.estado === 'Finalizada'"
                      @servicio-actualizado="actualizarServicio"
                      @servicio-completado="completarServicio"
                      @servicio-eliminado="eliminarServicio"
                    />

                    <OrdenLaboratorio
                      v-else-if="servicio.tipo?.toLowerCase() === 'laboratorio'"
                      :servicio-id="servicio.id"
                      :atencion-id="String(atencionActualData.id)"
                      :datos-iniciales="servicio.datos"
                      :modo-lectura="servicio.completado || atencionActualData.estado === 'Finalizada'"
                      @servicio-actualizado="actualizarServicio"
                      @servicio-completado="completarServicio"
                      @servicio-eliminado="eliminarServicio"  
                    />

                    <ServicioRayosX
                      v-else-if="servicio.tipo?.toLowerCase() === 'rayosx'"
                      :servicio-id="servicio.id"
                      :atencion-id="String(atencionActualData.id)"
                      :datos-iniciales="servicio.datos"
                      :modo-lectura="servicio.completado || atencionActualData.estado === 'Finalizada'"
                      @servicio-actualizado="actualizarServicio"
                      @servicio-completado="completarServicio"
                      @servicio-eliminado="eliminarServicio"  
                    />

                    <ServicioUltrasonido
                      v-else-if="servicio.tipo?.toLowerCase() === 'ultrasonido'"
                      :servicio-id="servicio.id"
                      :atencion-id="String(atencionActualData.id)"
                      :datos-iniciales="servicio.datos"
                      :modo-lectura="servicio.completado || atencionActualData.estado === 'Finalizada'"
                      @servicio-actualizado="actualizarServicio"
                      @servicio-completado="completarServicio"
                      @servicio-eliminado="eliminarServicio"  
                    />

                    <ServicioExploracionFisica
                      v-else-if="servicio.tipo?.toLowerCase() === 'exploracion'"
                      :servicio-id="servicio.id"
                      :atencion-id="String(atencionActualData.id)"
                      :datos-iniciales="servicio.datos"
                      :modo-lectura="servicio.completado || atencionActualData.estado === 'Finalizada'"
                      @servicio-actualizado="actualizarServicio"
                      @servicio-completado="completarServicio"
                      @servicio-eliminado="eliminarServicio"
                    />

                    <ServicioHospitalizacion
                      v-else-if="servicio.tipo?.toLowerCase() === 'hospitalizacion'"
                      :servicio-id="servicio.id"
                      :atencion-id="String(atencionActualData.id)"
                      :datos-iniciales="servicio.datos"
                      :modo-lectura="servicio.completado || atencionActualData.estado === 'Finalizada'"
                      @servicio-actualizado="actualizarServicio"
                      @servicio-completado="completarServicio"
                      @servicio-eliminado="eliminarServicio"
                    />

                    <ServicioMedicamento
                      v-else-if="servicio.tipo?.toLowerCase() === 'medicamentos'"
                      :servicio-id="servicio.id"
                      :atencion-id="String(atencionActualData.id)"
                      :datos-iniciales="servicio.datos"
                      :modo-lectura="servicio.completado || atencionActualData.estado === 'Finalizada'"
                      @servicio-actualizado="actualizarServicio"
                      @servicio-completado="completarServicio"
                      @servicio-eliminado="eliminarServicio"
                    />

                    <ServicioFisioterapia
                      v-else-if="servicio.tipo?.toLowerCase() === 'rehabilitacion'"
                      :servicio-id="servicio.id"
                      :atencion-id="String(atencionActualData.id)"
                      :datos-iniciales="servicio.datos"
                      :modo-lectura="servicio.completado || atencionActualData.estado === 'Finalizada'"
                      @servicio-actualizado="actualizarServicio"
                      @servicio-completado="completarServicio"
                      @servicio-eliminado="eliminarServicio"
                    />

                    <ServicioUrgencia
                      v-else-if="servicio.tipo?.toLowerCase() === 'emergencia'"
                      :servicio-id="servicio.id"
                      :atencion-id="String(atencionActualData.id)"
                      :datos-iniciales="servicio.datos"
                      :modo-lectura="servicio.completado || atencionActualData.estado === 'Finalizada'"
                      @servicio-actualizado="actualizarServicio"
                      @servicio-completado="completarServicio"
                      @servicio-eliminado="eliminarServicio"
                    />

                    <ServicioEstetica
                      v-else-if="servicio.tipo?.toLowerCase() === 'estetica'"
                      :servicio-id="servicio.id"
                      :atencion-id="String(atencionActualData.id)"
                      :datos-iniciales="servicio.datos"
                      :modo-lectura="servicio.completado || atencionActualData.estado === 'Finalizada'"
                      @servicio-actualizado="actualizarServicio"
                      @servicio-completado="completarServicio"
                      @servicio-eliminado="eliminarServicio"
                    />
                    
                    <!-- Componente genérico -->
                    <div v-else class="generic-service">
                      <div class="generic-service-content">
                        <q-avatar size="64px" :color="servicio.color" class="q-mb-md">
                          <q-icon :name="servicio.icono" size="32px" color="white" />
                        </q-avatar>
                        <div class="service-name">{{ servicio.nombre }}</div>
                        <div class="service-status">En desarrollo...</div>
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

      <!-- Estado vacío cuando no hay atenciones (v-else de la línea 168) -->
      <div class="content-scroll-area flex flex-center" v-else>
        <div class="text-center q-pa-xl empty-atención-state">
          <q-icon name="medical_services" size="100px" color="grey-4" class="q-mb-md" />
          <div class="text-h5 text-grey-8 text-weight-bold">No hay atenciones registradas</div>
          <p class="text-grey-6 text-h6 q-mt-sm">
            Este paciente aún no registra ninguna atención clínica.<br>
            Haga clic en el botón <span class="text-primary text-weight-bolder">Nueva Atención</span> para comenzar.
          </p>
          <q-btn
            color="primary"
            icon="add"
            label="Crear Primera Atención"
            @click="nuevaAtencion"

            size="lg"
            class="q-mt-md"
          />
        </div>
      </div>

      <!-- BOTONES FLOTANTES -->
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

      <!-- DIALOGS -->
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
              :loading="cargandoCatalogos"
              label="Profesional Asignado *"
              outlined dense emit-value map-options
              :rules="[val => !!val || 'Campo obligatorio']"
            >
              <template v-slot:prepend><q-icon name="badge" color="primary" /></template>
            </q-select>
            <q-select
              v-model="formNuevaAtencion.motivo_id"
              :options="motivosOpciones"
              :loading="cargandoCatalogos"
              label="Motivo de la Atención *"
              outlined dense emit-value map-options
              :rules="[val => !!val || 'Campo obligatorio']"
            >
              <template v-slot:prepend><q-icon name="event_note" /></template>
            </q-select>
            <q-input
              v-model="formNuevaAtencion.observaciones"
              label="Observaciones Iniciales"
              type="textarea" rows="3" outlined dense
            />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="Cancelar" color="grey-7" @click="showNuevaAtencionDialog = false" />
            <q-btn unelevated label="Crear Atención" color="primary" @click="crearNuevaAtencion" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <q-dialog v-model="showAddServiceDialog" persistent class="servicios-dialog">
        <div class="dialog-content q-pa-lg bg-white">
          <ServiciosDisponibles
            :servicios-aplicados="serviciosAplicados"
            :servicios-dinamicos="serviciosDinamicosParaLista"
            :servicios-catalogo="catalogoServiciosBD"
            :atencion-finalizada="atenciones.length > 0 && atenciones[atencionActual].estado === 'Finalizada'"
            @agregar-servicio="agregarServicioEnDialogo"
            @close="showAddServiceDialog = false"
          />
        </div>
      </q-dialog>

      <q-dialog v-model="showSearchDialog" full-width full-height>
        <q-card class="column full-height">
          <q-card-section class="row items-center q-pb-none bg-primary text-white">
            <div class="text-h6">Buscar Paciente</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup text-color="white" />
          </q-card-section>
          <q-card-section class="col q-pa-md scroll">
            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-12 col-md-3">
                <q-input v-model="busquedaFormData.propietario.primerapellido" label="Primer Apellido" dense outlined @keyup.enter="buscarPacientes" class="uppercase" />
              </div>
              <div class="col-12 col-md-3">
                <q-input v-model="busquedaFormData.propietario.nombre" label="Nombre Propietario" dense outlined @keyup.enter="buscarPacientes" class="uppercase" />
              </div>
              <div class="col-12 col-md-3">
                <q-input v-model="busquedaFormData.mascota.nombre" label="Nombre Mascota" dense outlined @keyup.enter="buscarPacientes" />
              </div>
              <div class="col-12 col-md-3 flex items-center">
                <q-btn color="primary" icon="search" label="Buscar" @click="buscarPacientes" class="full-width" />
              </div>
            </div>
            <CardBusquedaPropietarioMascota 
              :rows="listaPropietariosBusqueda"  
              @refresh-data="buscarPacientes" 
              @limpiar-filtro="limpiarFiltrosBusqueda"
              @mascota-seleccionada="onMascotaSeleccionada"
            />
          </q-card-section>
        </q-card>
      </q-dialog>

    </div>
  </div>
</template>

<script>
import { ref, computed, onBeforeUnmount, watch, reactive, onMounted, defineAsyncComponent } from 'vue'
import { useQuasar } from 'quasar'
import { useMascotaSeleccionadaStore } from 'src/stores/mascotaSeleccionadaStore';
import { usePlantillas } from 'src/composables/usePlantillas'
import { servicioDinamicoService } from 'src/services/servicioDinamico.service'
import { profesionalService } from 'src/services/profesional.service'
import { citaMotivoService } from 'src/services/citaMotivo.service'
import atencionService from 'src/services/atencion.service'
import { atencionServicioService } from 'src/services/atencionServicio.service'
import NdPeticionControl from 'src/controles/rest.control'
import { DtoParametros } from 'src/controles/dto.parametros'
import { useDialogStore } from 'src/stores/DialogoUbicacion'

// Importación dinámica de componentes de servicios con lazy loading
const ServicioVacunacion = defineAsyncComponent(() => import('../components/servicios/ServicioVacunacion.vue'))
const ServicioDesparacitacion = defineAsyncComponent(() => import('../components/servicios/ServicioDesparacitacion.vue'))
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
const ServicioResumen = defineAsyncComponent(() => import('../components/servicios/ServicioResumen.vue'))
const ServicioDinamico = defineAsyncComponent(() => import('../components/servicios/ServicioDinamico.vue'))

import CardBusquedaPropietarioMascota from 'src/components/card/CardBusquedaPropietarioMascota.vue'

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
    ServicioDinamico,
    CardBusquedaPropietarioMascota,
  },
  setup() {
    const $q = useQuasar()
    const mascotaSeleccionadaStore = useMascotaSeleccionadaStore()
    const store = useDialogStore()

    // Estados reactivos
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

    // Esquemas para servicios dinámicos (se cargan de BD)
    const esquemasActivos = ref({})
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
          id_servicio_def: servicio.id_servicio || servicio.id,  // ID real de la tabla SERVICIO
          estado:          'pendiente'
        })

        // Usar el ID real de BD (no temporal) para poder hacer PUT/DELETE después
        const nuevoServicio = {
          id:         String(registrado?.id || `${servicio.tipo}_${Date.now()}`),  // ID de BD como string
          idBD:       registrado?.id,          // guardamos el int de BD para operaciones REST
          tipo:       (servicio.componente_clave || servicio.tipo || servicio.identificador)?.toLowerCase(),
          nombre:     servicio.nombre,
          icono:      servicio.icono,
          color:      servicio.color,
          completado: false,
          timestamp:  new Date().toLocaleString(),
          datos:      {}
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
              await atencionServicioService.guardarVacunacion({
                id_atencion_servicio: servicio.idBD,
                id_producto:          v.producto?.id || v.producto?.value,
                tipo_vacuna:          v.tipoVacuna?.label || v.tipoVacuna,
                laboratorio:          v.laboratorio,
                lote:                 v.numeroLote || v.lote?.numeroLote,
                fecha_vencimiento:    v.fechaVencimiento,
                dosis:                Number(v.dosisAplicada),
                via_administracion:   v.viaAdministracion?.label || v.viaAdministracion,
                sitio_aplicacion:     v.sitioAplicacion,
                proxima_vacuna:       v.proximaVacuna,
                reacciones_adversas:  v.reaccionesAdversas ? `S: ${v.descripcionReacciones || ''}` : 'N'
              })

              // 3. Programar notificación de refuerzo si existe fecha
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
        const atencionesBase = lista.map(a => ({
          id: a.id,
          numero: a.numero || a.identificador || `A-${a.id}`,
          fecha: a.fecha || a.fechaalta?.split('T')[0] || '',
          hora: a.hora || a.fechaalta?.split('T')[1]?.substring(0, 5) || '',
          fechaFinalizacion: a.fecha_finalizacion || a.fechafinalizacion || '',
          horaFinalizacion: a.hora_finalizacion || a.horafinalizacion || '',
          veterinario: a.profesional?.nombre_completo ||
            `${a.profesional?.poblador_nombre || ''} ${a.profesional?.poblador_primerapellido || ''}`.trim() ||
            a.veterinario || 'Sin asignar',
          estado: a.estado || 'En curso',
          servicios: []
        }))

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
        atenciones.value[indiceAtencion].servicios = serviciosBD
          .filter(s => s.estado !== 'cancelado')  // no mostrar los eliminados
          .map(s => ({
            id:         String(s.id),
            idBD:       s.id,
            tipo:       (s.servicio?.componente_clave || s.servicio?.identificador || String(s.id_servicio))?.toLowerCase(),
            nombre:     s.servicio?.nombre || `Servicio ${s.id_servicio}`,
            icono:      s.servicio?.icono || 'medical_services',
            color:      s.servicio?.color || 'primary',
            completado: s.estado === 'completado',
            datos:      {},  // los valores EAV se pueden expandir aquí si se necesitan
            timestamp:  s.fecha_creacion ? new Date(s.fecha_creacion).toLocaleString() : ''
          }))
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
        
        // Cargar esquemas de servicios de forma paralela (solo para los dinámicos)
        const serviciosActivos = serviciosDinamicos.filter(s => s.activo === 'S')
        const promesasEsquemas = serviciosActivos
          .filter(s => s.tipo_renderizado !== 'especializado')
          .map(srv => 
            servicioDinamicoService.getEsquemaServicio(srv.id)
              .then(esquema => {
                if (esquema && esquema.identificador) {
                  esquemasActivos.value[esquema.identificador] = esquema
                }
              })
          )
        
        await Promise.all(promesasEsquemas)

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
      cargandoConfiguracion
    }
  }
}
</script>

<style scoped>
/* Layout principal */
.fullscreen-atencion {
  height: 100vh;
  background: #f8fafc;
  overflow: hidden;
}

.app-column-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
}

/* Cabecera Premium Rediseñada */
.main-header-premium {
  height: auto;
  min-height: 85px;
  padding: 12px 24px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  z-index: 100;
}

.header-profile-section {
  display: flex;
  align-items: center;
}

.patient-profile-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 6px 12px;
  border-radius: 12px;
}

.profile-avatar {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-primary-soft {
  background: rgba(25, 118, 210, 0.08);
}

.patient-name {
  font-size: 1.4rem;
  margin: 0;
  color: #1a202c;
  line-height: 1.2;
}

.patient-brief {
  color: #64748b;
  font-size: 0.85rem;
}

.header-v-divider {
  width: 1px;
  height: 40px;
  background: #e2e8f0;
  margin: 0 20px;
}

.owner-info .label-tiny, 
.attention-id-card .label-tiny {
  font-size: 9px;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 2px;
}

.owner-fullname {
  font-size: 0.95rem;
  color: #334155;
  white-space: nowrap;
}

.attention-number {
  font-size: 1.25rem;
  line-height: 1;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Barra de Historial Horizontal (Timeline) */
.attentions-timeline-bar {
  display: flex;
  align-items: center;
  background: white;
  padding: 10px 24px;
  border-bottom: 1px solid #e2e8f0;
  gap: 20px;
  z-index: 90;
}

.timeline-header {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  padding-right: 15px;
  border-right: 1px solid #e2e8f0;
}

.timeline-scroll-container {
  display: flex;
  align-items: center;
  gap: 10px;
  overflow-x: auto;
  padding: 4px 2px;
  scrollbar-width: thin;
}

.timeline-scroll-container::-webkit-scrollbar {
  height: 4px;
}

.timeline-scroll-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

.timeline-item-pill {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  background: #f1f5f9;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
  white-space: nowrap;
  user-select: none;
}

.timeline-item-pill:hover {
  background: #e2e8f0;
  transform: translateY(-1px);
}

.timeline-item-pill.active {
  background: #eff6ff;
  border-color: #3b82f6;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.1);
}

.timeline-item-pill.active .item-number {
  color: #2563eb;
  font-weight: 700;
}

.item-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.item-data {
  display: flex;
  flex-direction: column;
}

.item-number {
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
}

.item-date {
  font-size: 0.75rem;
  color: #94a3b8;
}

/* Área de Contenido */
.content-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f8fafc;
}

.status-banner {
  border-radius: 16px;
  color: white;
  margin-bottom: 24px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.status-banner.in-progress {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.status-banner.completed {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.status-label {
  font-size: 0.7rem;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-value {
  font-size: 1.1rem;
  font-weight: 700;
}

/* Servicios */
.services-card {
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #f1f5f9;
}

.modern-tabs {
  background: #f8fafc;
  padding: 8px 8px 0 8px;
}

.modern-tab {
  border-radius: 12px 12px 0 0;
  font-weight: 600;
  font-size: 0.85rem;
  margin-right: 4px;
}

.resumen-tab {
  background: white !important;
  color: #1a202c !important;
}

.modern-tab-panels {
  background: white;
  min-height: 600px;
}

/* Empty States */
.empty-atención-state {
  max-width: 500px;
}

.empty-services {
  height: 300px;
}

/* Floating Actions */
.floating-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.action-btn:hover {
  transform: scale(1.1) rotate(2deg);
}

/* Animations */
.animate-pop {
  animation: pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes pop {
  0% { transform: scale(0.9); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .5; }
}

/* Responsive */
@media (max-width: 1024px) {
  .header-v-divider {
    margin: 0 10px;
  }
}

@media (max-width: 768px) {
  .main-header-premium {
    flex-direction: column;
    align-items: stretch;
    padding: 15px;
  }
  .header-actions {
    margin-top: 15px;
    justify-content: center;
  }
}

/* Servicios Dialog */
.servicios-dialog .q-dialog__inner > div {
  width: 95vw;
  max-width: 1200px;
  min-width: 320px;
  border-radius: 20px;
}

.dialog-content {
  max-height: 85vh;
  overflow-y: auto;
}

.generic-service {
  padding: 60px 20px;
  display: flex;
  justify-content: center;
}

.generic-service-content {
  text-align: center;
}

.service-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
}

.service-status {
  color: #64748b;
  margin: 10px 0;
}
</style>
