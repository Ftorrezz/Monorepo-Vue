import { ref, onMounted } from "vue";
import NdPeticionControl from "src/controles/rest.control";
import { exportFile } from "quasar";
import NdAlertasControl from "src/controles/alertas.control";
import { useDialogStore } from "../../../neo-auth/src/stores/DialogoUbicacion";
import PeticionService from "src/services/peticion.service";
import { computed } from "vue";
import { columnsConfig } from "src/config/columnsConfig";
import { formConfig } from "src/config/formConfig";

export default function useCrud(modelName, tituloVentanaeliminacion) {
  const ubicacionStore = useDialogStore();
  const tableData = ref([]);
  const tableColumns = ref([]);
  let alertas = new NdAlertasControl();
  let filter = ref("");
  let formFields = ref();
  const myForm = ref(null);
  //const mostrarContrasenia = ref(false);
  let mostrarFormIntegrado = ref(false); //formulario y tabla en misma vision
  let formDialogModal = ref(false);
  const editedIndex = ref(-1);
  const sitios = ref([]);
  const _listaTipoSitioUbicacion = ref([]);
  const editedItem = ref({
    id_sitio: null,//ubicacionStore.id_sitio,
    activo: "S",
    id_configuracion: 1
  });

  const defaultItem = ref({
    id_sitio: null,//ubicacionStore.id_sitio,
    activo: "S",
    id_configuracion: 1
  });
  /********************** DEFINO LAS COLUMNAS Y CAMPOS DE LAS TABLAS****************************/

  const generateColumnsConfig = (modelName) => {
    // Lista de modelos que usan la configuración de columnas genérica
    const genericoModels = [
      "color", "especie", "razamascota", "caracter", "dieta", "habitat",
      "especialidad", "escolaridad", "estadocivil", "religion", "razapoblador",
      "ocupacion", "servicio", "tipoprofesional", "perfilconfiguracion", "citamotivo"
    ];

    if (genericoModels.includes(modelName)) {
      return columnsConfig["genericoDescripcion"] || [];
    }

    // Para el resto, busca una configuración específica (ej. 'sexo', 'diagnostico').
    // Si no la encuentra, devuelve un array vacío para evitar errores.
    return columnsConfig[modelName] || [];
  };

  /* let columnsConfig = [
     {
       name: "id",
       required: true,
       label: "Id",
       align: "left",
       field: (row) => row.id,
       format: (val) => `${val}`,
       sortable: true,
     },
     // Otras columnas comunes a todos los modelos...
   ];

   // Agregar columnas específicas de cada modelo
   if (modelName === "color") {
     columnsConfig = columnsConfig.concat([
       {
         name: "descripcion",
         align: "left",
         label: "Descripción",
         field: "descripcion",
         sortable: true,
       },
       {
         name: "paridad",
         align: "left",
         label: "Paridad",
         field: "paridad",
         sortable: true,
       },
       {
         name: "activo",
         label: "Activo",
         field: "activo",
         sortable: true,
         align: "center",
       },
     ]);
   }

   columnsConfig = columnsConfig.concat([
     {
       name: "action",
       align: "center",
       field: "action",
       sortable: false,
     },
   ]);

   // Agregar más casos según tus modelos y sus columnas específicas...

   return columnsConfig;
 };*/

  /*const formConfig = {
    genericodescripcion: [
      {
        name: "descripcion",
        label: "Descripción",
        component: "q-input",
        classes: ["uppercase"],
        rules: [(val) => (val && val.length > 0) || "Ingrese una descripción"],
      },
      //{ name: "codigoexterno", label: "Código externo", component: "q-input" },
      { name: "activo", label: "Activo", component: "q-checkbox" },
      // Otros campos según el modelo...
    ],

    sitio: [
      //{ name: "id", label: "Id", component: "q-input" },
      {
        name: "descripcion",
        label: "Descripción",
        component: "q-input",
        classes: ["q-mb-xs"],
        rules: [(val) => (val && val.length > 0) || "Ingrese una descripción"],
      },
      {
        name: "paisidentificador",
        label: "Identificador País",
        component: "q-input",
        classes: ["q-mb-xs", "uppercase"],
        rules: [
          (val) =>
            (val && val.length > 0) || "Ingrese un identificador de país",
        ],
      },
      {
        name: "urlservidor",
        label: "Url Servidor",
        component: "q-input",
        classes: ["q-mb-xs"],
        rules: [
          (val) => (val && val.length > 0) || "Ingrese la url de servidor",
        ],
      },
      {
        name: "offset",
        label: "offset",
        component: "q-input",
        classes: ["q-mb-xs"],
        rules: [(val) => (val && val.length > 0) || "Offset requerido"],
        //type:"number"
      },
      {
        name: "activo",
        label: "Activo",
        component: "q-checkbox",
        classes: ["q-mb-xs"],
      },

      // Otros campos según el modelo...
    ],

    sucursal: [
      //{ name: "id", label: "Id", component: "q-input" },
      {
        name: "descripcion",
        label: "Nombre",
        component: "q-input",
        classes: ["q-mb-xs"],
        rules: [
          (val) =>
            (val && val.length > 0) || "Ingrese el nombre de la sucursal",
        ],
      },
      {
        name: "abreviatura",
        label: "Abreviatura",
        component: "q-input",
        classes: ["q-mb-xs"],
        rules: [
          (val) =>
            (val && val.length > 0) ||
            "Ingrese una abreviatura de identificador",
        ],
      },
      {
        name: "responsable",
        label: "Responsable",
        component: "q-input",
        classes: ["q-mb-xs"],
        rules: [
          (val) =>
            (val && val.length > 0) || "Ingrese el responsable de la sucursal",
        ],
      },
      {
        name: "direccion",
        label: "Dirección",
        component: "q-input",
        classes: ["q-mb-xs"],
        rules: [
          (val) =>
            (val && val.length > 0) || "Ingrese la dirección de la sucursal",
        ],
        //type:"number"
      },
      {
        name: "id_sitio",
        label: "Sitio",
        component: "q-select",
        classes: ["q-mb-xs"],
        options: sitios.value,
        rules: [(val) => !!val || "Seleccione un sitio"],
        //rules: [(val) => (val && val.length > 0) || "Seleccione un sitio"]
      },
      {
        name: "activo",
        label: "Activo",
        component: "q-checkbox",
        classes: ["q-mb-xs"],
      },

      // Otros campos según el modelo...
    ],
    configuracion: [
      //{ name: "id", label: "Id", component: "q-input" },
      {
        name: "descripcion",
        label: "Descripción",
        component: "q-input",
        classes: ["q-mb-xs"],
        rules: [
          (val) =>
            (val && val.length > 0) || "Ingrese la descripción de la configuración",
        ],
      },
      {
        name: "id_sitio",
        label: "Sitio",
        component: "q-select",
        classes: ["q-mb-xs"],
        options: sitios.value,
        rules: [(val) => !!val || "Seleccione un sitio"],
        //rules: [(val) => (val && val.length > 0) || "Seleccione un sitio"]
      },
      {
        name: "activo",
        label: "Activo",
        component: "q-checkbox",
        classes: ["q-mb-xs"],
      },

      // Otros campos según el modelo...
    ],

    color: [
      //{ name: "id", label: "Id", component: "q-input" },
      {
        name: "descripcion",
        label: "Descripción",
        component: "q-input",
        classes: ["q-mb-xs"],
        rules: [
          (val) =>
            (val && val.length > 0) || "Ingrese la descripción del tipo de ubicación",
        ],
      },
      {
        name: "paridad",
        label: "Paridad",
        component: "q-input",
        classes: ["q-mb-xs"],
        rules: [
          (val) =>
            (val && val.length > 0) || "Ingrese la paridad externa",
        ],
      },
      {
        name: "activo",
        label: "Activo",
        component: "q-checkbox",
        classes: ["q-mb-xs"],
      },

    ],
    sitioubicacion: [
      //{ name: "id", label: "Id", component: "q-input" },
      {
        name: "descripcion",
        label: "Descripción",
        component: "q-input",
        classes: ["q-mb-xs"],
        rules: [
          (val) =>
            (val && val.length > 0) || "Ingrese la descripción de la configuración",
        ],
      },
      {
        name: "id_sitio",
        label: "Sitio",
        component: "q-select",
        classes: ["q-mb-xs"],
        options: sitios.value,
        rules: [(val) => !!val || "Seleccione un sitio"],
        //rules: [(val) => (val && val.length > 0) || "Seleccione un sitio"]
      },
      {
        name: "id_tipositioubicacion",
        label: "Sitio Ubicación",
        component: "q-select",
        classes: ["q-mb-xs"],
        options: _listaTipoSitioUbicacion.value,
        rules: [(val) => !!val || "Seleccione el tipo de ubicación del sitio"],
        //rules: [(val) => (val && val.length > 0) || "Seleccione un sitio"]
      },
      {
        name: "activo",
        label: "Activo",
        component: "q-checkbox",
        classes: ["q-mb-xs"],
      },

      // Otros campos según el modelo...
    ],

    EjemploModel: [
      { name: "id", label: "Id", component: "q-input" },
      { name: "name", label: "Nombre", component: "q-input" },
      { name: "price", label: "Precio", component: "q-input" },
      // Otros campos según el modelo...
    ],

    // Otros modelos y sus campos aquí...
  };*/

  const generateFormConfig = () => {
    if (
      modelName === "color" ||
      modelName === "sexo" ||
      modelName === "especie" ||
      modelName === "razamascota" ||
      modelName === "caracter" ||
      modelName === "dieta" ||
      modelName === "habitat" ||
      modelName === "especialidad" ||
      modelName === "diagnostico" ||
      modelName === "escolaridad" ||
      modelName === "estadocivil" ||
      modelName === "religion" ||
      modelName === "razapoblador" ||
      modelName === "ocupacion" ||
      modelName === "servicio" ||
      modelName === "tipoprofesional" ||
      modelName === "perfilconfiguracion" ||
      modelName === "sitio" ||
      modelName === "sucursal" ||
      modelName === "configuracion" ||
      modelName === "tipositioubicacion" ||
      modelName === "sitioubicacion" ||
      modelName === "generoconfiguracion" ||
      modelName === "citamotivo"
    ) {
      mostrarFormIntegrado.value = true;

      // Utilizar el formulario genérico de observación

      if (modelName === "sexo" ||
        modelName === "diagnostico" ||
        modelName === "sitio" ||
        modelName === "sucursal" ||
        modelName === "configuracion" ||
        modelName === "tipositioubicacion" ||
        modelName === "sitioubicacion" ||
        modelName === "generoconfiguracion") {
        return formConfig[modelName] || [];
      } else return formConfig["genericoDescripcion"] || [];
    } else {
      // Utilizar el formulario específico para el modelo
      return formConfig[modelName] || [];
    }
  };

  formFields.value = generateFormConfig();

  const getFormConfig = async () => {
    await getSitios();
    await getTipoSitioUbicacion();
    formFields.value = generateFormConfig();
    if (modelName === "sucursal" || modelName === "configuracion" || modelName === "sitioubicacion") {
      formFields.value.find((field) => field.name === "id_sitio").options =
        sitios.value;
    }
    if (modelName === "sitioubicacion") {
      formFields.value.find(
        (field) => field.name === "id_tipositioubicacion"
      ).options = _listaTipoSitioUbicacion.value;
    }
  };

  const getSitios = async () => {
    try {
      const _peticion = new NdPeticionControl();
      const _respuesta = await _peticion.invocarMetodo("sitio", "get");
      sitios.value = _respuesta.map((sitio) => ({
        label: sitio.descripcion,
        value: sitio.id,
      }));
    } catch (error) {
      alertas.mostrarMensaje(
        "error",
        "Sitios",
        "Error al obtener la lista de sitios"
      );
    }
  };

  const getTipoSitioUbicacion = async () => {
    try {
      const _peticion = new NdPeticionControl();
      const _respuesta = await _peticion.invocarMetodo("tipositioubicacion", "get");
      _listaTipoSitioUbicacion.value = _respuesta.map((sitioUbicacion) => ({
        label: sitioUbicacion.descripcion,
        value: sitioUbicacion.id,
      }));
    } catch (error) {
      alertas.mostrarMensaje(
        "error",
        "Tipo Sitio Ubicación",
        "Error al obtener la lista de tipos de sitios"
      );
    }
  };

  onMounted(() => {
    getFormConfig();
  });

  const getData = async () => {
    try {
      const _peticion = new NdPeticionControl();

      const _respuesta = await _peticion.invocarMetodo(modelName, "get");

      const modelColumns = generateColumnsConfig(modelName);

      // Asignar las columnas basadas en la configuración del modelo
      tableColumns.value = modelColumns;

      tableData.value = _respuesta;
    } catch (error) {
      alertas.mostrarMensaje(
        "error",
        modelName,
        "Error al obtener los datos de la tabla"
      );
    }
  };

  // Llama a la función para obtener los datos cuando se carga el composable
  getData();

  const submitForm = () => {
    // Lógica para enviar el formulario
  };

  const createItem = () => {
    // Lógica para crear un nuevo elemento
  };

  /*const updateItem = () => {
    // Lógica para actualizar un elemento
  };*/

  let deleteItem = async (item) => {
    try {
      editedIndex.value = item.rowIndex;

      const peticionService = new PeticionService();

      const _respuesta = await peticionService.eliminar(
        modelName,
        Object.assign({}, item.row),
        true,
        tituloVentanaeliminacion
      );

      getData();
      close();
    } catch (error) {
      alertas.mostrarMensaje(
        "error",
        "Eliminar",
        "No fue posible borrar el registro"
      );
    }
  };

  const updateItem = async (item) => {
    editedIndex.value = item.rowIndex;
    editedItem.value = Object.assign({}, item.row);

    //mostrarContrasenia.value = false;
    formDialogModal.value = true;
  };

  const agregarRegistro = () => {
    //mostrarContrasenia.value = true;
    formDialogModal.value = true;
  };

  const exportTable = () => {
    // naive encoding to csv format
    const content = [tableColumns.value.map((col) => wrapCsvValue(col.label))]
      .concat(
        tableData.value.map((row) =>
          tableColumns.value
            .map((col) =>
              wrapCsvValue(
                typeof col.field === "function"
                  ? col.field(row)
                  : row[col.field === void 0 ? col.name : col.field],
                col.format,
                row
              )
            )
            .join(",")
        )
      )
      .join("\r\n");

    const status = exportFile(`${modelName}.csv`, content, "text/csv");

    if (status !== true)
      alertas.mostrarMensaje(
        "advertencia",
        "Exportar",
        "El navegador a denegado el acceso para la descarga ..."
      );
    else
      alertas.mostrarMensaje(
        "verificacion",
        "Exportar",
        "Archivo generado correctamente"
      );
  };

  function wrapCsvValue(val, formatFn, row) {
    let formatted = formatFn !== void 0 ? formatFn(val, row) : val;

    formatted =
      formatted === void 0 || formatted === null ? "" : String(formatted);

    formatted = formatted.split('"').join('""');

    return `"${formatted}"`;
  }

  const validate = () => {
    myForm.value.validate().then((success) => {
      if (success) {
        guardarRegistro();
      }
    });
  };

  const formTitle = computed(() =>
    editedIndex.value === -1 ? "Agregar Usuario" : "Editar Usuario"
  );

  const mostrarContrasenia = computed(() =>
    editedIndex.value === -1 ? true : false
  );

  const guardarRegistro = async () => {
    const peticionService = new PeticionService();

    // Verificar si id_sitio es null y asignar el valor del store
    if (editedItem.value.id_sitio === null) {
      editedItem.value.id_sitio = ubicacionStore.id_sitio;
    }

    let dataToSend = { ...editedItem.value };
    if (dataToSend.descripcion) {
      dataToSend.descripcion = dataToSend.descripcion.toUpperCase();
    }

    //ACTUALIZARE REGISTRO
    let _respuesta;

    if (editedIndex.value > -1) {
      if (modelName === "usuario") {
        delete dataToSend.clave;
      }
      if (modelName === "sitio" ||
        modelName === "tipositioubicacion" ||
        modelName === "color" ||
        modelName === "citamotivo") {
        delete dataToSend.id_sitio;
      }

      if (modelName === "sucursal" ||
        modelName === "configuracion" ||
        modelName === "perfilconfiguracion") {
        dataToSend.id_sitio = dataToSend.id_sitio.value;
      }

      if (modelName === "perfilconfiguracion" || modelName === "servicio") {
        dataToSend.id_configuracion = 1;
      }

      if (dataToSend.offset) {
        dataToSend.offset = Number(dataToSend.offset);
      }

      _respuesta = await peticionService.actualizar(modelName, dataToSend);
    } else {
      //CREAR NUEVO REGISTRO

      if (modelName === "sitio" ||
        modelName === "tipositioubicacion" ||
        modelName === "color" ||
        modelName === "citamotivo") {
        delete dataToSend.id_sitio;
      }

      if (modelName === "sucursal" ||
        modelName === "configuracion" ||
        modelName === "perfilconfiguracion" ||
        modelName === "sitioubicacion") {
        dataToSend.id_sitio = dataToSend.id_sitio.value;
      }

      if (modelName === "sitioubicacion") {
        dataToSend.id_tipositioubicacion = dataToSend.id_tipositioubicacion.value;
        dataToSend.id_ubicacionexterno = 0;
      }

      if (modelName === "perfilconfiguracion" || modelName === "servicio") {

        dataToSend.id_configuracion = 1;
      }

      if (dataToSend.offset) {
        dataToSend.offset = Number(dataToSend.offset);
      }

      _respuesta = await peticionService.crear(modelName, dataToSend);
    }

    if (!_respuesta.status) {
      getData();
      close();
    }
  };

  const close = () => {
    editedItem.value = Object.assign({}, defaultItem.value);
    editedIndex.value = -1;
    myForm.value.resetValidation();
    formDialogModal.value = false;
  };

  return {
    tableData,
    tableColumns,
    submitForm,
    createItem,
    updateItem,
    deleteItem,
    exportTable,
    filter,
    formFields,
    myForm,
    validate,
    editedItem,
    close,
    mostrarFormIntegrado,
    agregarRegistro,
    formDialogModal,
    mostrarContrasenia,
    formTitle,
  };
}
