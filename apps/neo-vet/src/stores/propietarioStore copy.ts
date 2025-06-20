import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import PeticionService from 'src/services/peticion.service';

export interface Propietario {
  id: number;
  primerapellido: string;
  segundoapellido: string;
  nombre: string;
  email: string;
  telefono1: string;
  activo: string;
}

export const usePropietarioStore = defineStore('propietarioStore', {
  state: () => ({
    propietarios: [] as Propietario[],
    propietarioSeleccionado: null as Propietario | null,
    propietarioSeleccionadoId: null as number | null,
    datosOriginales: [] as any[], // Para mantener los datos originales de la búsqueda
    propietariosRecienAgregados: new Set<number>(), // Para rastrear propietarios recién agregados
    propietariosAgregadosTemporalmente: [] as any[], // Lista separada de propietarios agregados temporalmente
    ultimoPropietarioAgregado: null as Propietario | null, // Para rastrear el último propietario agregado
  }),

  getters: {
    // Obtener la lista de propietarios únicos procesados
    propietariosRows: (state) => {
      const propietariosUnicos = new Map();

      // Procesar datos originales
      state.datosOriginales.forEach(item => {
        console.log('Procesando item:', item);
        if (item.propietario && !propietariosUnicos.has(item.propietario.id)) {
          propietariosUnicos.set(item.propietario.id, {
            id: item.propietario.id,
            primerapellido: item.propietario.primerapellido || '',
            segundoapellido: item.propietario.segundoapellido || '',
            nombre: item.propietario.nombre || '',
            email: '',
            telefono1: '',
            activo: item.activo
          });
        }
      });

      // Procesar propietarios agregados temporalmente
      state.propietariosAgregadosTemporalmente.forEach(item => {
        if (item.propietario && !propietariosUnicos.has(item.propietario.id)) {
          propietariosUnicos.set(item.propietario.id, {
            id: item.propietario.id,
            primerapellido: item.propietario.primerapellido || '',
            segundoapellido: item.propietario.segundoapellido || '',
            nombre: item.propietario.nombre || '',
            email: '',
            telefono1: '',
            activo: item.activo
          });
        }
      });

      return Array.from(propietariosUnicos.values());
    },

    // Obtener el propietario seleccionado actual
    propietarioActual: (state) => state.propietarioSeleccionado,

    // Verificar si hay un propietario seleccionado
    tienePropietarioSeleccionado: (state) => state.propietarioSeleccionadoId !== null,

    // Verificar si el propietario seleccionado fue recién agregado
    propietarioRecienAgregado: (state) => {
      return state.propietarioSeleccionadoId && state.propietariosRecienAgregados.has(state.propietarioSeleccionadoId);
    },

    // Obtener mascotas filtradas por propietario seleccionado
    mascotasFiltradas: (state) => {
      // Combinar datos originales con propietarios agregados temporalmente
      const todosLosDatos = [...state.datosOriginales, ...state.propietariosAgregadosTemporalmente];

      if (!state.propietarioSeleccionadoId) {
        return todosLosDatos
          .filter(item => item.mascota)
          .map(item => ({
            id: item.mascota?.id,
            nombre: item.mascota?.nombre || '',
            historiaclinica: item.mascota?.historiaclinica || '',
            propietarioId: item.propietario?.id
          }));
      }

      return todosLosDatos
        .filter(item => item.mascota && item.propietario?.id === state.propietarioSeleccionadoId)
        .map(item => ({
          id: item.mascota?.id,
          nombre: item.mascota?.nombre || '',
          historiaclinica: item.mascota?.historiaclinica || '',
          propietarioId: item.propietario?.id
        }));
    }
  },

  actions: {
    // Establecer los datos originales (resultado de búsqueda)
    setDatosOriginales(datos: any[]) {
      // Actualizar datos originales
      this.datosOriginales = datos;

      // Si hay un último propietario agregado, intentar seleccionarlo
      if (this.ultimoPropietarioAgregado) {
        const propietarioEncontrado = datos.find(item =>
          item.propietario && item.propietario.id === this.ultimoPropietarioAgregado?.id
        );

        if (propietarioEncontrado && this.ultimoPropietarioAgregado) {
          console.log('Propietario recién agregado encontrado en datos:', propietarioEncontrado.propietario);
          this.seleccionarPropietario(propietarioEncontrado.propietario);
          this.propietariosRecienAgregados.add(propietarioEncontrado.propietario.id);
          this.ultimoPropietarioAgregado = null; // Limpiar después de seleccionar
        } else {
          console.log('Propietario recién agregado no encontrado en datos actualizados');
        }
      }

      // Actualizar propietarios temporales con datos completos si están disponibles
      this.propietariosAgregadosTemporalmente = this.propietariosAgregadosTemporalmente.map(tempItem => {
        const datosCompletos = datos.find(item =>
          item.propietario && item.propietario.id === tempItem.propietario.id
        );

        if (datosCompletos && datosCompletos.propietario) {
          // Actualizar con datos completos
          return {
            ...tempItem,
            propietario: datosCompletos.propietario
          };
        }

        return tempItem;
      });

      // Limpiar propietarios agregados temporalmente solo si es una nueva búsqueda
      // (no cuando se actualiza después de agregar un propietario)
      if (datos.length > 0 && this.propietariosAgregadosTemporalmente.length > 0) {
        // Verificar si es una nueva búsqueda comparando con los datos anteriores
        const esNuevaBusqueda = !datos.some(item =>
          this.propietariosAgregadosTemporalmente.some(temp =>
            temp.propietario && temp.propietario.id === item.propietario?.id
          )
        );

        if (esNuevaBusqueda) {
          this.propietariosAgregadosTemporalmente = [];
          this.propietariosRecienAgregados.clear();
        }
      }

      // Procesar selección automática solo si no hay propietario recién agregado
      if (!this.ultimoPropietarioAgregado) {
        this.procesarSeleccionAutomatica();
      }
    },

    // Seleccionar un propietario
    seleccionarPropietario(propietario: Propietario) {
      this.propietarioSeleccionado = propietario;
      this.propietarioSeleccionadoId = propietario.id;
    },

    // Limpiar la selección
    limpiarSeleccion() {
      this.propietarioSeleccionado = null;
      this.propietarioSeleccionadoId = null;
    },

    // Procesar selección automática cuando cambian los datos
    procesarSeleccionAutomatica() {
      const propietarios = this.propietariosRows;

      if (propietarios.length > 0) {
        // Verificar si el propietario seleccionado actual existe en los nuevos resultados
        const propietarioExiste = propietarios.some(p => p.id === this.propietarioSeleccionadoId);

        // Si no existe un propietario seleccionado o el actual no está en los resultados
        if (!this.propietarioSeleccionadoId || !propietarioExiste) {
          this.seleccionarPropietario(propietarios[0]);
        }
      } else {
        // Si no hay propietarios, limpiar la selección
        this.limpiarSeleccion();
      }
    },

    // Agregar un nuevo propietario a la lista (NUEVA FUNCIONALIDAD)
    agregarPropietario(nuevoPropietario: Propietario) {
      // Buscar si ya existe en los datos originales
      const existe = this.datosOriginales.some(item =>
        item.propietario && item.propietario.id === nuevoPropietario.id
      );

      if (!existe) {
        // Agregar el nuevo propietario a los datos originales
        this.datosOriginales.push({
          propietario: nuevoPropietario,
          activo: 'S'
        });
      }

      // IMPORTANTE: Siempre seleccionar el nuevo propietario, sin importar el filtro
      this.seleccionarPropietario(nuevoPropietario);
    },

    // Agregar propietario temporalmente para mostrar en la lista actual
    agregarPropietarioTemporal(nuevoPropietario: Propietario) {
      // Agregar el propietario a la lista temporal
      this.propietariosAgregadosTemporalmente.push({
        propietario: nuevoPropietario,
        activo: 'S'
      });

      // Marcar como recién agregado
      this.propietariosRecienAgregados.add(nuevoPropietario.id);

      // Seleccionar inmediatamente el nuevo propietario
      this.seleccionarPropietario(nuevoPropietario);
    },

    // Actualizar un propietario existente
    actualizarPropietario(propietarioActualizado: Propietario) {
      // Actualizar en datos originales
      this.datosOriginales = this.datosOriginales.map(item => {
        if (item.propietario && item.propietario.id === propietarioActualizado.id) {
          return {
            ...item,
            propietario: propietarioActualizado
          };
        }
        return item;
      });

      // Si es el propietario seleccionado, actualizarlo también
      if (this.propietarioSeleccionadoId === propietarioActualizado.id) {
        this.seleccionarPropietario(propietarioActualizado);
      }
    },

    // Eliminar un propietario
    eliminarPropietario(propietarioId: number) {
      // Filtrar de datos originales
      this.datosOriginales = this.datosOriginales.filter(item =>
        !item.propietario || item.propietario.id !== propietarioId
      );

      // Si era el propietario seleccionado, limpiar selección
      if (this.propietarioSeleccionadoId === propietarioId) {
        this.limpiarSeleccion();
      }
    },

    // Buscar propietario por ID
    buscarPropietarioPorId(id: number): Propietario | null {
      return this.propietariosRows.find(p => p.id === id) || null;
    },

    // Verificar si un propietario existe en la lista actual
    propietarioExisteEnLista(propietarioId: number): boolean {
      return this.propietariosRows.some(p => p.id === propietarioId);
    },

    // Nueva función: Manejar propietario agregado desde diálogo
    async manejarPropietarioAgregado(propietarioGuardado: Propietario) {
      console.log('Propietario agregado:', propietarioGuardado);

      // Guardar el último propietario agregado para seleccionarlo cuando lleguen los datos
      this.ultimoPropietarioAgregado = propietarioGuardado;

      console.log('Esperando actualización de datos desde el filtro...');
    },

    // Buscar datos completos del propietario por ID
    async buscarDatosCompletosPropietario(propietarioId: number) {
      try {
        console.log('Buscando datos completos para propietario ID:', propietarioId);

        const peticionService = new PeticionService();

        // Usar el mismo endpoint que la búsqueda principal pero filtrando por ID específico
        const dtoParametros = {
          filtro: {
            id_sitio: 1,
            id_propietario: propietarioId // Filtrar por ID específico
          }
        };

        const resultado = await peticionService.crear("filtropropietariomascota/filtro", dtoParametros);

        if (resultado && resultado.length > 0) {
          // Buscar el propietario específico en los resultados
          const propietarioCompleto = resultado.find((item: any) =>
            item.propietario && item.propietario.id === propietarioId
          );

          if (propietarioCompleto) {
            console.log('Datos completos encontrados:', propietarioCompleto);

            // Agregar el propietario con datos completos
            this.agregarPropietarioTemporal(propietarioCompleto.propietario);
          } else {
            console.error('No se encontró el propietario específico en los resultados');
            this.crearPropietarioBasico(propietarioId);
          }
        } else {
          console.error('No se encontraron datos para el propietario ID:', propietarioId);
          this.crearPropietarioBasico(propietarioId);
        }
      } catch (error) {
        console.error('Error al buscar datos del propietario:', error);
        this.crearPropietarioBasico(propietarioId);
      }
    },

    // Crear propietario básico cuando no se pueden obtener datos completos
    crearPropietarioBasico(propietarioId: number) {
      const propietarioBasico = {
        id: propietarioId,
        primerapellido: 'N/A',
        segundoapellido: '',
        nombre: 'Propietario',
        email: '',
        telefono1: '',
        activo: 'S'
      };
      this.agregarPropietarioTemporal(propietarioBasico);
    },

    // Limpiar propietarios temporales (para nueva búsqueda)
    limpiarPropietariosTemporales() {
      this.propietariosAgregadosTemporalmente = [];
      this.propietariosRecienAgregados.clear();
    }
  },

  persist: false // No persistir este store ya que los datos vienen de búsquedas
});
