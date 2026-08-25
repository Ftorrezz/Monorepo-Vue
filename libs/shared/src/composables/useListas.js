import NdPeticionControl from "src/controles/rest.control";
import configuracionParametrosService from "src/services/configuracionParametros.service";
import { ref, onMounted } from "vue";

const CATALOGOS_LEGACY = {
  especie: { idModulo: 3, idTabla: 5 },
  raza: { idModulo: 3, idTabla: 10 },
  razamascota: { idModulo: 3, idTabla: 10 },
  sexo: { idModulo: 3, idTabla: 12 },
  color: { idModulo: 3, idTabla: 1 },
  dieta: { idModulo: 3, idTabla: 3 },
  habitat: { idModulo: 3, idTabla: 8 },
  caracter: { idModulo: 3, idTabla: 2 },
  genero: { idModulo: 5, idTabla: 7 }
};

export default function useListas() {
  /**
   * Obtiene una lista genérica desde el backend
   * @param {string} endpoint - El endpoint para obtener la lista
   * @param {Object} options - Opciones de configuración
   * @param {string} options.valueField - Campo a usar como value (default: 'id')
   * @param {string} options.labelField - Campo a usar como label (default: 'descripcion')
   * @param {Object} options.filtro - Filtro opcional para la petición
   * @param {boolean} options.cargarAlIniciar - Si debe cargar al iniciar (default: true)
   * @returns {Object} - Objeto con la lista y métodos para manipularla
   */
  const obtenerLista = (endpoint, options = {}) => {
    const {
      valueField = 'id',
      labelField = 'descripcion',
      filtro = null,
      cargarAlIniciar = true
    } = options;

    const lista = ref([]);
    const cargando = ref(false);
    const error = ref(null);

    const mapearLista = (items) => {
      const data = Array.isArray(items) ? items : (items?.data || []);
      return data
        .filter(item => item.activo === 'S' || item.activo === true || item.activo === undefined)
        .map(item => ({
          value: item[valueField],
          label: item[labelField],
          original: item
        }));
    };

    // Función para cargar los datos
    const cargarDatos = async () => {
      cargando.value = true;
      error.value = null;

      try {
        const catalogoLegacy = endpoint && CATALOGOS_LEGACY[endpoint?.toLowerCase?.()];

        if (catalogoLegacy) {
          const respuesta = await configuracionParametrosService.getParametros(
            catalogoLegacy.idModulo,
            catalogoLegacy.idTabla
          );

          lista.value = mapearLista(respuesta);
          return;
        }

        const _peticion = new NdPeticionControl();
        let parametros = null;

        if (filtro) {
          parametros = { filtro };
        }

        const _respuesta = await _peticion.invocarMetodo(endpoint, "get", null, parametros);

        lista.value = (_respuesta || []).map(item => ({
          value: item[valueField],
          label: item[labelField],
          original: item
        }));
      } catch (err) {
        error.value = err;
        console.error(`Error al cargar lista desde ${endpoint}:`, err);
      } finally {
        cargando.value = false;
      }
    };

    if (cargarAlIniciar) {
      onMounted(cargarDatos);
    }

    return {
      lista,
      cargando,
      error,
      cargarDatos
    };
  };

  return {
    obtenerLista
  };
}