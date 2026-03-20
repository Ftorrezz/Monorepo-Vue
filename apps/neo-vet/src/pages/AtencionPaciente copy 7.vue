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
              :disable="!paciente || !paciente.id"
              style="font-weight: 700; height: 48px;"
            />
            <div v-if="!paciente || !paciente.id" class="text-caption text-white text-center q-mt-xs opacity-7">
              Selecciona un paciente primero
            </div>
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
                  <div class="row items-center">
                    <div class="info-title">{{ paciente.nombre }}</div>
<!-- Search button moved -->
                  </div>
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
              <div class="info-group" v-if="atenciones.length > 0">
                <div class="info-content">
                  <div class="info-label">IDENTIFICADOR DE ATENCIÓN</div>
                  <div class="info-value accent-text">{{ atenciones[atencionActual]?.numero }}</div>
                  <div class="info-subtext">
                    <q-icon name="event" size="14px" /> {{ formatDate(atenciones[atencionActual]?.fecha) }}
                  </div>
                </div>
              </div>
              <div class="info-group" v-else>
                <div class="info-content">
                  <div class="info-label">IDENTIFICADOR DE ATENCIÓN</div>
                  <div class="info-value accent-text text-grey-5">Sin atenciones</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="header-actions">
            <q-btn
              color="primary"
              icon="search"
              label="Buscar Paciente"
              @click="showSearchDialog = true"
              no-caps
              flat
              dense
              class="q-mr-sm"
            />
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
              :disable="atenciones.length === 0 || atencionActualData.estado === 'Finalizada'"
              no-caps
              unelevated
              rounded
            />
          </div>
        </div>

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
                      <!-- 1. Componente Dinámico (EAV/Metadata PoC) - Prioridad Alta -->
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

                      <!-- 2. Componentes Especializados Hardcoded -->
                      <ServicioVacunacion
                        v-else-if="servicio.tipo === 'vacunacion'"
                        :servicio-id="servicio.id"
                        :atencion-id="String(atencionActualData.id)"
                        :datos-iniciales="servicio.datos"
                        :modo-lectura="servicio.completado || atencionActualData.estado === 'Finalizada'"
                        @servicio-actualizado="actualizarServicio"
                        @servicio-completado="completarServicio"
                        @servicio-eliminado="eliminarServicio"
                      />

                      <!-- Componente de Desparacitación -->
                      <ServicioDesparacitacion
                        v-else-if="servicio.tipo === 'desparacitacion'"
                        :servicio-id="servicio.id"
                        :atencion-id="String(atencionActualData.id)"
                        :datos-iniciales="servicio.datos"
                        :modo-lectura="servicio.completado || atencionActualData.estado === 'Finalizada'"
                        @servicio-actualizado="actualizarServicio"
                        @servicio-completado="completarServicio"
                        @servicio-eliminado="eliminarServicio"
                      />
                      <!-- Componente de Laboratorio -->
                      <OrdenLaboratorio
                        v-else-if="servicio.tipo === 'laboratorio'"
                        :servicio-id="servicio.id"
                        :atencion-id="String(atencionActualData.id)"
                        :datos-iniciales="servicio.datos"
                        :modo-lectura="servicio.completado || atencionActualData.estado === 'Finalizada'"
                        @servicio-actualizado="actualizarServicio"
                        @servicio-completado="completarServicio"
                        @servicio-eliminado="eliminarServicio"  
                      />
                      <!-- Componente de Rayos X -->
                      <ServicioRayosX
                        v-else-if="servicio.tipo === 'rayosx'"
                        :servicio-id="servicio.id"
                        :atencion-id="String(atencionActualData.id)"
                        :datos-iniciales="servicio.datos"
                        :modo-lectura="servicio.completado || atencionActualData.estado === 'Finalizada'"
                        @servicio-actualizado="actualizarServicio"
                        @servicio-completado="completarServicio"
                        @servicio-eliminado="eliminarServicio"  
                      />
                      <ServicioUltrasonido
                        v-else-if="servicio.tipo === 'ultrasonido'"
                        :servicio-id="servicio.id"
                        :atencion-id="String(atencionActualData.id)"
                        :datos-iniciales="servicio.datos"
                        :modo-lectura="servicio.completado || atencionActualData.estado === 'Finalizada'"
                        @servicio-actualizado="actualizarServicio"
                        @servicio-completado="completarServicio"
                        @servicio-eliminado="eliminarServicio"  
                      />
                      <ServicioExploracionFisica
                        v-else-if="servicio.tipo === 'exploracion'"
                        :servicio-id="servicio.id"
                        :atencion-id="String(atencionActualData.id)"
                        :datos-iniciales="servicio.datos"
                        :modo-lectura="servicio.completado || atencionActualData.estado === 'Finalizada'"
                        @servicio-actualizado="actualizarServicio"
                        @servicio-completado="completarServicio"
                        @servicio-eliminado="eliminarServicio"
                      />
                      <ServicioHospitalizacion
                        v-else-if="servicio.tipo === 'hospitalizacion'"
                        :servicio-id="servicio.id"
                        :atencion-id="String(atencionActualData.id)"
                        :datos-iniciales="servicio.datos"
                        :modo-lectura="servicio.completado || atencionActualData.estado === 'Finalizada'"
                        @servicio-actualizado="actualizarServicio"
                        @servicio-completado="completarServicio"
                        @servicio-eliminado="eliminarServicio"
                      />
                      <ServicioMedicamento
                        v-else-if="servicio.tipo === 'medicamentos'"
                        :servicio-id="servicio.id"
                        :atencion-id="String(atencionActualData.id)"
                        :datos-iniciales="servicio.datos"
                        :modo-lectura="servicio.completado || atencionActualData.estado === 'Finalizada'"
                        @servicio-actualizado="actualizarServicio"
                        @servicio-completado="completarServicio"
                        @servicio-eliminado="eliminarServicio"
                      />
                      <ServicioFisioterapia
                        v-else-if="servicio.tipo === 'rehabilitacion'"
                        :servicio-id="servicio.id"
                        :atencion-id="String(atencionActualData.id)"
                        :datos-iniciales="servicio.datos"
                        :modo-lectura="servicio.completado || atencionActualData.estado === 'Finalizada'"
                        @servicio-actualizado="actualizarServicio"
                        @servicio-completado="completarServicio"
                        @servicio-eliminado="eliminarServicio"
                      />
                      <ServicioUrgencia
                        v-else-if="servicio.tipo === 'emergencia'"
                        :servicio-id="servicio.id"
                        :atencion-id="String(atencionActualData.id)"
                        :datos-iniciales="servicio.datos"
                        :modo-lectura="servicio.completado || atencionActualData.estado === 'Finalizada'"
                        @servicio-actualizado="actualizarServicio"
                        @servicio-completado="completarServicio"
                        @servicio-eliminado="eliminarServicio"
                      />
                      <ServicioEstetica
                        v-else-if="servicio.tipo === 'estetica'"
                        :servicio-id="servicio.id"
                        :atencion-id="String(atencionActualData.id)"
                        :datos-iniciales="servicio.datos"
                        :modo-lectura="servicio.completado || atencionActualData.estado === 'Finalizada'"
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

        <!-- Estado vacío cuando no hay atenciones -->
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
              rounded
              unelevated
              size="lg"
              class="q-mt-md"
            />
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
            :loading="cargandoCatalogos"
            label="Profesional Asignado *"
            outlined
            dense
            emit-value
            map-options
            :rules="[val => !!val || 'Campo obligatorio']"
          >
            <template v-slot:prepend>
              <q-icon name="badge" color="primary" />
            </template>
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section avatar>
                  <q-avatar color="primary" text-color="white" size="38px" style="font-size:15px; font-weight:700;">
                    {{ (scope.opt.label || '?')[0].toUpperCase() }}
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label style="font-weight:600;">{{ scope.opt.label }}</q-item-label>
                  <q-item-label caption v-if="scope.opt.especialidad">
                    <q-icon name="medical_services" size="12px" /> {{ scope.opt.especialidad }}
                  </q-item-label>
                  <q-item-label caption v-if="scope.opt.cedula">
                    <q-icon name="badge" size="12px" /> Céd. {{ scope.opt.cedula }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-chip dense color="positive" text-color="white" size="sm" v-if="scope.opt.activo === 'S'">
                    Activo
                  </q-chip>
                </q-item-section>
              </q-item>
            </template>
            <template v-slot:selected-item="scope">
              <div class="row items-center no-wrap">
                <q-avatar color="primary" text-color="white" size="24px" class="q-mr-sm" style="font-size:11px; font-weight:700;">
                  {{ (scope.opt.label || '?')[0].toUpperCase() }}
                </q-avatar>
                <span>{{ scope.opt.label }}</span>
                <q-badge v-if="scope.opt.cedula" color="grey-4" text-color="grey-8" class="q-ml-sm">
                  Céd. {{ scope.opt.cedula }}
                </q-badge>
              </div>
            </template>
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">No hay profesionales disponibles</q-item-section>
              </q-item>
            </template>
          </q-select>

          <q-select
            v-model="formNuevaAtencion.motivo_id"
            :options="motivosOpciones"
            :loading="cargandoCatalogos"
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
          :servicios-dinamicos="serviciosDinamicosParaLista"
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
    <q-dialog v-model="showSearchDialog" full-width full-height>
      <q-card class="column full-height">
        <q-card-section class="row items-center q-pb-none bg-primary text-white">
          <div class="text-h6">Buscar Paciente</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup text-color="white" />
        </q-card-section>

        <q-card-section class="col q-pa-md scroll">
          <!-- Filtros de búsqueda (Simplificado del original) -->
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

          <!-- Componente de resultados -->
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
</template>

<script>
import { ref, computed, onBeforeUnmount, watch, reactive, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useMascotaSeleccionadaStore } from 'src/stores/mascotaSeleccionadaStore';
import { usePlantillas } from 'src/composables/usePlantillas'
import { servicioDinamicoService } from 'src/services/servicioDinamico.service'
import { profesionalService } from 'src/services/profesional.service'
import { citaMotivoService } from 'src/services/citaMotivo.service'
import atencionService from 'src/services/atencion.service'
import NdPeticionControl from 'src/controles/rest.control'
import { DtoParametros } from 'src/controles/dto.parametros'
import { useDialogStore } from 'src/stores/DialogoUbicacion'

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
    const cargandoCatalogos = ref(false)

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

    const mostrarAtenciones = () => {
      $q.dialog({
        title: 'Historial de Atenciones',
        message: `Este paciente tiene ${atenciones.value.length} atenciones registradas. Haga clic en cualquier tarjeta para seleccionarla.`,
        ok: 'Entendido'
      })
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
        
        const datosServicio = {
          id_atencion: atenciones.value[atencionActual.value].id,
          tipo_servicio: servicio.identificador || servicio.tipo, 
          datos: servicio.datos_iniciales || {},
          observaciones: '',
          estado: 'pendiente'
        }
        
        const respuesta = await atencionService.agregarServicio(datosServicio)
        
        if (respuesta) {
            // Actualizar vista local
            const nuevoServicio = {
              id: `${servicio.tipo}_${Date.now()}`,
              tipo: servicio.tipo,
              nombre: servicio.nombre,
              icono: servicio.icono,
              color: servicio.color,
              completado: false,
              timestamp: new Date().toLocaleString(),
              datos: servicio.datos_iniciales || {}
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
        }
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
        // El backend puede devolver un array directo o anidado en 'elemento'
        const lista = Array.isArray(datos)
          ? datos
          : (datos?.elemento || datos?.data || [])

        if (!Array.isArray(lista) || lista.length === 0) {
          // Sin atenciones en backend: dejamos el array vacío
          atenciones.value = []
          atencionActual.value = 0
          return
        }

        atenciones.value = lista.map(a => ({
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
          servicios: a.servicios || []
        }))

        atencionActual.value = 0
      } catch (error) {
        console.error('Error al cargar atenciones desde backend:', error)
        $q.notify({ type: 'warning', message: 'No se pudieron cargar las atenciones del paciente' })
      }
    }

    // Cargar catálogos y esquemas dinámicos al montar
    onMounted(async () => {
      try {
        // Cargar profesionales y motivos usando las funciones dedicadas
        await Promise.all([
          cargarProfesionalesParaAtencion(),
          cargarMotivosParaAtencion()
        ])

        // Cargar servicios dinámicos
        const serviciosDinamicos = await servicioDinamicoService.getServicios()
        
        // Cargar esquemas para servicios activos
        for (const srv of serviciosDinamicos.filter(s => s.activo === 'S')) {
          const esquema = await servicioDinamicoService.getEsquemaServicio(srv.id)
          if (esquema && esquema.identificador) {
            esquemasActivos.value[esquema.identificador] = esquema
          }
        }
        
        // Si ya hay mascota seleccionada, cargar sus atenciones
        if (paciente.value && paciente.value.paciente_id) {
            await cargarAtencionesDesdeBackend(paciente.value.paciente_id)
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
      atencionActualData,
      serviciosDinamicosParaLista,
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
      cargandoCatalogos,
      profesionalesOpciones,
      motivosOpciones,
      esquemasActivos,
      catalogosSistemas,
      imprimirDocumentoServicio,
      imprimirResumenAtencion,
      // Buscador
      showSearchDialog,
      listaPropietariosBusqueda,
      busquedaFormData,
      buscarPacientes,
      limpiarFiltrosBusqueda,
      onMascotaSeleccionada
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
