// src/stores/propietarioStore.js
import { defineStore } from 'pinia';
import PeticionService from 'src/services/peticion.service';
import NdAlertasControl from 'src/controles/alertas.control';
import { nextTick } from 'vue';

const peticionService = new PeticionService(); // Puedes instanciarlo aquí o pasarlo si lo gestionas de otra forma
const alertas = new NdAlertasControl();

export const usePropietarioStore = defineStore('propietario', {
  state: () => ({
    listaPropietarios: [],
    // Almacena los filtros actuales que se usaron para la búsqueda
    filtrosActuales: {},
    propietarioSeleccionadoId: null,
    isLoading: false,
  }),

  getters: {
    propietarioSeleccionado: (state) => {
      if (state.propietarioSeleccionadoId) {
        return state.listaPropietarios.find(p => p.id === state.propietarioSeleccionadoId) || null;
      }
      return null;
    },
    // Formatea los propietarios para la q-table en CardBusquedaPropietarioMascota
    propietariosRowsForTable: (state) => {
      return state.listaPropietarios.map(propietario => ({
        id: propietario.id,
        primerapellido: propietario.primerapellido || '',
        segundoapellido: propietario.segundoapellido || '',
        nombre: propietario.nombre || '',
        email: propietario.email || '', // Asegúrate que estos campos existan en tu modelo de propietario
        telefonomovil: propietario.telefono1 || '',
        activo: propietario.activo,
        // ... otros campos que necesite la tabla
      }));
    }
  },

  actions: {
    // Acción interna para manejar la selección después de cargar datos
    async _gestionarSeleccionAutomatica() {
      await nextTick(); // Esperar a que el DOM se actualice
      if (this.listaPropietarios.length > 0) {
        const propietarioActualEnLista = this.listaPropietarios.some(p => p.id === this.propietarioSeleccionadoId);
        // Si no hay selección o el seleccionado ya no está en la lista (ej. por filtros), selecciona el primero
        if (!this.propietarioSeleccionadoId || !propietarioActualEnLista) {
          this.seleccionarPropietario(this.listaPropietarios[0].id);
        }
      } else {
        this.propietarioSeleccionadoId = null; // No hay propietarios, no hay selección
      }
    },

    // Acción para ser llamada por el componente que tiene los filtros de búsqueda
    async buscarPropietariosConFiltros(filtros = {}) {
      this.isLoading = true;
      this.filtrosActuales = { ...filtros }; // Guardar los filtros usados
      try {
        // Asume que tu PeticionService.listar o un método específico puede tomar filtros
        // Ejemplo: const respuesta = await peticionService.listar('propietario/buscar', filtros);
        // O si listar trae todos y filtras en frontend (menos ideal para grandes datasets):
        const respuesta = await peticionService.listar('propietario', filtros); // Ajusta según tu API

        this.listaPropietarios = respuesta.elementos || []; // Ajusta según la estructura de tu respuesta
        await this._gestionarSeleccionAutomatica();
      } catch (error) {
        console.error("Error al buscar propietarios en store:", error);
        this.listaPropietarios = [];
        // PeticionService usualmente maneja las alertas de error de API
      } finally {
        this.isLoading = false;
      }
    },

    async agregarOActualizarPropietario(datosPropietarioPayload) {
      this.isLoading = true;
      try {
        let propietarioGuardado;
        if (datosPropietarioPayload.id) {
          propietarioGuardado = await peticionService.actualizar('propietario', datosPropietarioPayload);
        } else {
          // Si es un nuevo propietario, eliminamos el id si es null para evitar problemas con el backend
          if (datosPropietarioPayload.id === null || datosPropietarioPayload.id === undefined) {
            delete datosPropietarioPayload.id;
          }
          propietarioGuardado = await peticionService.crear('propietario', datosPropietarioPayload);
        }

        if (propietarioGuardado) { // PeticionService devuelve el elemento en caso de éxito
          // **CLAVE: Limpiar filtros o usar filtros que incluyan al nuevo propietario**
          // Para asegurar que el nuevo propietario ("ramiro") aparezca,
          // recargamos la lista sin filtros o con filtros que lo incluyan.
          // La forma más simple es recargar sin filtros.
          this.filtrosActuales = {}; // Resetea los filtros
          await this.buscarPropietariosConFiltros(); // Recarga la lista (ahora sin filtros)

          // Seleccionar el propietario recién agregado/actualizado
          if (propietarioGuardado.id) {
            this.seleccionarPropietario(propietarioGuardado.id);
          }
          // PeticionService ya debería haber mostrado la notificación de éxito.
          return propietarioGuardado; // Devuelve el propietario guardado para confirmación
        }
        return false; // Indicar fallo si no se guardó
      } catch (error) {
        console.error("Error al guardar propietario en store:", error);
        // PeticionService ya maneja alertas de error de API
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    seleccionarPropietario(propietarioId) {
      this.propietarioSeleccionadoId = propietarioId;
    },

    limpiarSeleccionPropietario() {
      this.propietarioSeleccionadoId = null;
    },

    async eliminarPropietarioDesdeStore(propietario) {
      this.isLoading = true;
      try {
        const resultado = await peticionService.eliminar('propietario', propietario, true, 'Propietario');
        if (resultado !== false) {
          // Si el propietario eliminado era el seleccionado, limpiar la selección
          if (this.propietarioSeleccionadoId === propietario.id) {
            this.propietarioSeleccionadoId = null;
          }
          // Recargar la lista con los filtros actuales para reflejar la eliminación
          await this.buscarPropietariosConFiltros(this.filtrosActuales);
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error al eliminar propietario en store:", error);
        return false;
      } finally {
        this.isLoading = false;
      }
    },
  },
});
