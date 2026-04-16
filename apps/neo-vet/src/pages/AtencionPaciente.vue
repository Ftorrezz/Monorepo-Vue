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

          <div class="header-v-divider"></div>

          <!-- Bloque Profesional Asignado -->
          <!-- <div class="veterinario-card pointer-cursor" @click="verDetallesAtencion">
            <div class="label-tiny">PROFESIONAL ASIGNADO</div>
            <div class="row items-center no-wrap">
              <q-icon name="medical_services" size="18px" color="primary" class="q-mr-xs" />
              <div class="text-subtitle1 text-weight-bold text-primary">
                {{ atencionActualData.veterinario }}
              </div>
            </div>
          </div> -->
        </div>

        <div class="header-actions">
          <div class="row no-wrap items-center q-gutter-sm">
            <!-- Botón Nueva Atención -->
            <q-btn
              unelevated
              color="white"
              text-color="primary"
              icon="add"
              label="Nueva Atención"
              @click="nuevaAtencion"
              :disable="!paciente || !paciente.id"
              no-caps
              class="text-weight-bold shadow-1"
              style="height: 40px;"
            />

            <q-btn
              color="primary"
              icon="search"
              label="Buscar Paciente"
              @click="showSearchDialog = true"
              no-caps
              flat
              class="search-btn-premium"
              style="height: 40px;"
            />
            
            <q-separator vertical class="q-mx-xs" />

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
              icon="add_circle"
              label="Nuevo Servicio"
              @click="showAddServiceDialog = true"
              :disable="atenciones.length === 0 || atencionActualData.estado === 'Finalizada'"
              no-caps
              class="add-service-btn animate-pop text-weight-bold"
              style="height: 40px;"
            />
          </div>
        </div>
      </div>

      <!-- Barra de Historial Horizontal Ultra-Compacta -->
      <div class="attentions-timeline-bar" v-if="atenciones.length > 0">
        <div class="timeline-layout">
          <!-- Etiqueta -->
          <div class="timeline-header-side">
            <div class="history-label">
              <q-icon name="history" size="18px" color="primary" />
              <span class="text-caption text-weight-bold">HISTORIAL</span>
              <q-badge color="grey-3" text-color="grey-8" dense class="q-ml-xs" style="font-size: 9px">{{ atenciones.length }}</q-badge>
            </div>
          </div>
          
          <!-- Línea de Tiempo Siempre Visible -->
          <div class="timeline-wrapper-compact">
            <div class="timeline-track"></div>
            <div class="timeline-scroll-container">
              <div
                v-for="(atencion, index) in atenciones"
                :key="atencion.id"
                class="timeline-node"
                :class="{ 
                  'active': atencionActual === index,
                  'is-current': atencion.estado === 'En curso'
                }"
                @click="atencionActual = index"
              >
                <div class="node-marker">
                  <div class="marker-ring"></div>
                  <div class="marker-dot"></div>
                  <div class="pulse-ring" v-if="atencion.estado === 'En curso'"></div>
                </div>
                <div class="node-content">
                  <span class="node-number">{{ atencion.numero }}</span>
                  <span class="node-date">{{ formatDate(atencion.fecha) }}</span>
                </div>
                <q-tooltip anchor="bottom middle" self="top middle" :offset="[0, 12]" class="timeline-tooltip">
                  <div class="text-weight-bold">{{ atencion.veterinario }}</div>
                  <div class="text-caption">{{ atencion.estado }}</div>
                </q-tooltip>
              </div>
            </div>
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
                <div class="status-label">Profesional Asignado</div>
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
                      @imprimir-resumen="imprimirResumenAtencion"
                    />
                  </q-tab-panel>

                  <q-tab-panel
                    v-for="servicio in serviciosAplicados"
                    :key="servicio.id"
                    :name="servicio.id"
                    class="q-pa-md"
                  >
                    <!-- 1. Componente Dinámico (EAV/Metadata PoC) -->
                    <template v-if="servicio.tipo_renderizado === 'dinamico'">
                      <div v-if="cargandoEsquema && !esquemasActivos[servicio.tipo]" class="flex flex-center q-pa-xl">
                        <q-spinner-dots color="primary" size="40px" />
                        <div class="q-ml-md text-grey-7">Cargando diseño del servicio...</div>
                      </div>
                      
                      <ServicioDinamico
                        v-else-if="esquemasActivos[servicio.tipo]"
                        :schema="esquemasActivos[servicio.tipo]"
                        :servicio-id="servicio.id"
                        :atencion-id="String(atencionActualData.id)"
                        :datos-iniciales="servicio.datos"
                        :modo-lectura="servicio.completado || atencionActualData.estado === 'Finalizada'"
                        :catalogos="catalogosSistemas"
                        @servicio-actualizado="actualizarServicio"
                        @servicio-completado="completarServicio"
                        @servicio-eliminado="eliminarServicio"
                        @imprimir-servicio="imprimirDocumentoServicio(servicio)"
                      />
                    </template>
 
                    <!-- 2. Componentes Especializados -->
                    <ServicioConsultaGeneral
                      v-else-if="servicio.tipo?.toLowerCase() === 'consulta' || servicio.componente_clave === 'consulta'"
                      :servicio-id="servicio.id"
                      :plantillas-servicio="servicio.plantillas_servicio"
                      :atencion-id="String(atencionActualData.id)"
                      :datos-iniciales="servicio.datos"
                      :modo-lectura="servicio.completado || atencionActualData.estado === 'Finalizada'"
                      :motivos="motivosOpciones"
                      @servicio-actualizado="actualizarServicio"
                      @servicio-completado="completarServicio"
                      @servicio-eliminado="eliminarServicio"
                      @imprimir-servicio="(id, datos, tipo, idPlantilla) => imprimirDocumentoServicio(servicio, tipo, idPlantilla)"
                    />

                    <ServicioVacunacion
                      v-else-if="servicio.tipo?.toLowerCase() === 'vacunacion' || servicio.componente_clave === 'vacunacion'"
                      :servicio-id="servicio.id"
                      :id-plantilla="servicio.id_plantilla"
                      :plantillas-servicio="servicio.plantillas_servicio"
                      :atencion-id="String(atencionActualData.id)"
                      :datos-iniciales="servicio.datos"
                      :modo-lectura="servicio.completado || atencionActualData.estado === 'Finalizada'"
                      @servicio-actualizado="actualizarServicio"
                      @servicio-completado="completarServicio"
                      @servicio-eliminado="eliminarServicio"
                      @imprimir-servicio="(id, datos, tipo, idPlantilla) => imprimirDocumentoServicio(servicio, tipo, idPlantilla)"
                    />

                    <ServicioDesparasitacion
                      v-else-if="servicio.tipo?.toLowerCase() === 'desparacitacion' || servicio.tipo?.toLowerCase() === 'desparasitacion' || servicio.componente_clave === 'desparacitacion' || servicio.componente_clave === 'desparasitacion'"
                      :servicio-id="servicio.id"
                      :plantillas-servicio="servicio.plantillas_servicio"
                      :atencion-id="String(atencionActualData.id)"
                      :datos-iniciales="servicio.datos"
                      :modo-lectura="servicio.completado || atencionActualData.estado === 'Finalizada'"
                      @servicio-actualizado="actualizarServicio"
                      @servicio-completado="completarServicio"
                      @servicio-eliminado="eliminarServicio"
                      @imprimir-servicio="(id, datos, tipo, idPlantilla) => imprimirDocumentoServicio(servicio, tipo, idPlantilla)"
                    />

                    <OrdenLaboratorio
                      v-else-if="servicio.tipo?.toLowerCase() === 'laboratorio' || servicio.componente_clave === 'laboratorio'"
                      :servicio-id="servicio.id"
                      :atencion-id="String(atencionActualData.id)"
                      :datos-iniciales="servicio.datos"
                      :modo-lectura="servicio.completado || atencionActualData.estado === 'Finalizada'"
                      @servicio-actualizado="actualizarServicio"
                      @servicio-completado="completarServicio"
                      @servicio-eliminado="eliminarServicio"  
                      @imprimir-servicio="imprimirDocumentoServicio(servicio)"
                    />

                    <ServicioRayosX
                      v-else-if="servicio.tipo?.toLowerCase() === 'rayosx' || servicio.componente_clave === 'rayosx'"
                      :servicio-id="servicio.id"
                      :atencion-id="String(atencionActualData.id)"
                      :datos-iniciales="servicio.datos"
                      :modo-lectura="servicio.completado || atencionActualData.estado === 'Finalizada'"
                      @servicio-actualizado="actualizarServicio"
                      @servicio-completado="completarServicio"
                      @servicio-eliminado="eliminarServicio"  
                      @imprimir-servicio="imprimirDocumentoServicio(servicio)"
                    />

                    <ServicioUltrasonido
                      v-else-if="servicio.tipo?.toLowerCase() === 'ultrasonido' || servicio.componente_clave === 'ultrasonido'"
                      :servicio-id="servicio.id"
                      :atencion-id="String(atencionActualData.id)"
                      :datos-iniciales="servicio.datos"
                      :modo-lectura="servicio.completado || atencionActualData.estado === 'Finalizada'"
                      @servicio-actualizado="actualizarServicio"
                      @servicio-completado="completarServicio"
                      @servicio-eliminado="eliminarServicio"  
                      @imprimir-servicio="imprimirDocumentoServicio(servicio)"
                    />

                    <ServicioExploracionFisica
                      v-else-if="servicio.tipo?.toLowerCase() === 'exploracion' || servicio.componente_clave === 'exploracion'"
                      :servicio-id="servicio.id"
                      :atencion-id="String(atencionActualData.id)"
                      :datos-iniciales="servicio.datos"
                      :modo-lectura="servicio.completado || atencionActualData.estado === 'Finalizada'"
                      @servicio-actualizado="actualizarServicio"
                      @servicio-completado="completarServicio"
                      @servicio-eliminado="eliminarServicio"
                      @imprimir-servicio="imprimirDocumentoServicio(servicio)"
                    />

                    <ServicioHospitalizacion
                      v-else-if="servicio.tipo?.toLowerCase() === 'hospitalizacion' || servicio.componente_clave === 'hospitalizacion'"
                      :servicio-id="servicio.id"
                      :atencion-id="String(atencionActualData.id)"
                      :datos-iniciales="servicio.datos"
                      :modo-lectura="servicio.completado || atencionActualData.estado === 'Finalizada'"
                      @servicio-actualizado="actualizarServicio"
                      @servicio-completado="completarServicio"
                      @servicio-eliminado="eliminarServicio"
                      @imprimir-servicio="imprimirDocumentoServicio(servicio)"
                    />

                    <ServicioMedicamento
                      v-else-if="servicio.tipo?.toLowerCase() === 'medicamentos' || servicio.componente_clave === 'medicamentos'"
                      :servicio-id="servicio.id"
                      :atencion-id="String(atencionActualData.id)"
                      :datos-iniciales="servicio.datos"
                      :modo-lectura="servicio.completado || atencionActualData.estado === 'Finalizada'"
                      @servicio-actualizado="actualizarServicio"
                      @servicio-completado="completarServicio"
                      @servicio-eliminado="eliminarServicio"
                      @imprimir-servicio="imprimirDocumentoServicio(servicio)"
                    />

                    <ServicioFisioterapia
                      v-else-if="servicio.tipo?.toLowerCase() === 'rehabilitacion' || servicio.componente_clave === 'rehabilitacion'"
                      :servicio-id="servicio.id"
                      :atencion-id="String(atencionActualData.id)"
                      :datos-iniciales="servicio.datos"
                      :modo-lectura="servicio.completado || atencionActualData.estado === 'Finalizada'"
                      @servicio-actualizado="actualizarServicio"
                      @servicio-completado="completarServicio"
                      @servicio-eliminado="eliminarServicio"
                      @imprimir-servicio="imprimirDocumentoServicio(servicio)"
                    />

                    <ServicioUrgencia
                      v-else-if="servicio.tipo?.toLowerCase() === 'emergencia' || servicio.componente_clave === 'emergencia'"
                      :servicio-id="servicio.id"
                      :atencion-id="String(atencionActualData.id)"
                      :datos-iniciales="servicio.datos"
                      :modo-lectura="servicio.completado || atencionActualData.estado === 'Finalizada'"
                      @servicio-actualizado="actualizarServicio"
                      @servicio-completado="completarServicio"
                      @servicio-eliminado="eliminarServicio"
                      @imprimir-servicio="imprimirDocumentoServicio(servicio)"
                    />

                    <ServicioRecetaMedica
                      v-else-if="servicio.tipo?.toLowerCase() === 'receta' || servicio.componente_clave === 'receta'"
                      :servicio-id="servicio.id"
                      :plantillas-servicio="servicio.plantillas_servicio"
                      :atencion-id="String(atencionActualData.id)"
                      :datos-iniciales="servicio.datos"
                      :modo-lectura="servicio.completado || atencionActualData.estado === 'Finalizada'"
                      @servicio-actualizado="actualizarServicio"
                      @servicio-completado="completarServicio"
                      @servicio-eliminado="eliminarServicio"
                      @imprimir-servicio="(id, datos, tipo, idPlantilla) => imprimirDocumentoServicio(servicio, tipo, idPlantilla)"
                    />

                    <ServicioEstetica
                      v-else-if="servicio.tipo?.toLowerCase() === 'estetica' || servicio.componente_clave === 'estetica'"
                      :servicio-id="servicio.id"
                      :atencion-id="String(atencionActualData.id)"
                      :datos-iniciales="servicio.datos"
                      :modo-lectura="servicio.completado || atencionActualData.estado === 'Finalizada'"
                      @servicio-actualizado="actualizarServicio"
                      @servicio-completado="completarServicio"
                      @servicio-eliminado="eliminarServicio"
                      @imprimir-servicio="imprimirDocumentoServicio(servicio)"
                    />

                    <ServicioArchivos
                      v-else-if="servicio.tipo?.toLowerCase() === 'archivos' || servicio.tipo?.toLowerCase() === 'adjuntos' || servicio.componente_clave === 'archivos'"
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

      <!-- Estado vacío cuando no hay atenciones (v-else de la línea 178) -->
      <div class="content-scroll-area flex flex-center" v-else>
        <!-- CASO 1: No se ha seleccionado ningún paciente -->
        <div v-if="!paciente || !paciente.id" class="text-center q-pa-xl empty-atención-state">
          <q-icon name="person_search" size="100px" color="grey-4" class="q-mb-md" />
          <div class="text-h5 text-grey-8 text-weight-bold">Esperando selección de paciente</div>
          <p class="text-grey-6 text-h6 q-mt-sm">
            Para comenzar a registrar atenciones, primero debe buscar y seleccionar un paciente.<br>
            Utilice el botón <span class="text-primary text-weight-bolder">Buscar Paciente</span> en la parte superior.
          </p>
          <q-btn
            color="primary"
            icon="search"
            label="Buscar Paciente"
            @click="showSearchDialog = true"
            size="lg"
            class="q-mt-md"
          />
        </div>

        <!-- CASO 2: Paciente seleccionado pero sin historial -->
        <div v-else class="text-center q-pa-xl empty-atención-state">
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
import { useReportes } from 'src/composables/useReportes'
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
              } else if (tipo === 'desparacitacion' || tipo === 'desparasitacion' || (serviceDef?.componente_clave?.toLowerCase() === 'desparacitacion')) {
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

.veterinario-card .label-tiny {
  font-size: 9px;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 2px;
}

.pointer-cursor {
  cursor: pointer;
}

/* Barra de Historial Timeline Ultra-Compacta */
.attentions-timeline-bar {
  background: white;
  border-bottom: 1px solid #eef2f6;
  padding: 8px 24px;
  transition: all 0.3s ease;
  z-index: 90;
}

.attentions-timeline-bar.is-collapsed {
  padding: 4px 24px;
}

.timeline-layout {
  display: flex;
  align-items: center;
  gap: 20px;
  min-height: 40px;
}

.timeline-header-side {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  user-select: none;
}

.history-label {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 8px;
  transition: background 0.2s;
}

.history-label:hover {
  background: #f1f5f9;
}

.timeline-wrapper-compact {
  flex: 1;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
  padding: 10px 0;
}

.timeline-track {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background: #e2e8f0;
  transform: translateY(-50%);
  z-index: 1;
}

.timeline-scroll-container {
  display: flex;
  gap: 30px;
  overflow-x: auto;
  position: relative;
  z-index: 2;
  scrollbar-width: none;
}

.timeline-scroll-container::-webkit-scrollbar {
  display: none;
}

.timeline-node {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  min-width: fit-content;
  transition: all 0.3s ease;
}

.node-marker {
  position: relative;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.marker-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: white;
  border: 2px solid #cbd5e1;
  transition: all 0.3s ease;
}

.marker-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #cbd5e1;
  transition: all 0.3s ease;
  z-index: 2;
}

.timeline-node:hover .marker-ring {
  border-color: #3b82f6;
  transform: scale(1.1);
}

.timeline-node.active .marker-ring {
  border-color: #3b82f6;
  border-width: 5px;
}

.timeline-node.active .marker-dot {
  background: white;
  transform: scale(0.5);
}

.timeline-node.is-current .marker-ring {
  border-color: #f59e0b;
}

.timeline-node.is-current .marker-dot {
  background: #f59e0b;
}

.pulse-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid #f59e0b;
  animation: timeline-pulse 2s infinite;
}

@keyframes timeline-pulse {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1.8); opacity: 0; }
}

.node-content {
  display: flex;
  flex-direction: column;
}

.node-number {
  font-size: 0.8rem;
  font-weight: 700;
  color: #475569;
}

.node-date {
  font-size: 0.65rem;
  font-weight: 600;
  color: #94a3b8;
  margin-top: -2px;
}

.timeline-summary-view {
  flex: 1;
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 0;
}

.summary-item {
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  color: #64748b;
  background: #f8fafc;
  padding: 4px 12px;
  border-radius: 6px;
}

.timeline-tooltip {
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(4px);
  padding: 8px 12px;
  border-radius: 8px;
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
