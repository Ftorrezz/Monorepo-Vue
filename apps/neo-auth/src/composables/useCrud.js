import { ref } from "vue";
import NdPeticionControl from "src/controles/rest.control";
import { exportFile } from "quasar";
import NdAlertasControl from "src/controles/alertas.control";
import { useDialogStore } from "../../../neo-auth/src/stores/DialogoUbicacion";
import PeticionService from "src/services/peticion.service";
import { computed } from 'vue';

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
  const editedItem = ref(
    { id_sitio: ubicacionStore.id_sitio,
      activo: 'S'
      //id_configuracion: 1
  })

  const defaultItem = ref(
    { id_sitio: ubicacionStore.id_sitio,
      activo: 'S'
      //id_configuracion: 1
  })
  /********************** DEFINO LAS COLUMNAS Y CAMPOS DE LAS TABLAS****************************/
  const columnConfig = {
    perfilconfiguracion: ["id", "descripcion", "activo"],
    ProductModel: ["id", "name", "price"],
    usuario: ["id", "nombreusuario", "clave"],
    // Otros modelos y sus columnas aquí...
  };

  const generateColumnsConfig = (modelName) => {
    let columnsConfig = [
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
    if (modelName === "perfilconfiguracion") {
      columnsConfig = columnsConfig.concat([
        {
          name: "descripcion",
          align: "left",
          label: "Descripción",
          field: "descripcion",
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
    } else if (modelName === "ProductModel") {
      columnsConfig = columnsConfig.concat([
        {
          name: "name",
          align: "left",
          label: "Nombre",
          field: "name",
          sortable: true,
        },
        {
          name: "email",
          label: "Correo electrónico",
          field: "email",
          sortable: true,
          align: "center",
        },
        {
          name: "fechacaducidadclave",
          label: "Vigencia",
          field: "fechacaducidadclave",
          sortable: true,
          align: "center",
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

    else if (modelName === "usuario") {
      columnsConfig = columnsConfig.concat([
        {
          name: "nombreusuario",
          align: "left",
          label: "Nombre usuario",
          field: "nombreusuario",
          sortable: true,
        },
        {
          name: "email",
          label: "Correo electrónico",
          field: "email",
          sortable: true,
          align: "center",
        },
        {
          name: "fechacaducidadclave",
          label: "Vigencia",
          field: "fechacaducidadclave",
          sortable: true,
          align: "center",
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
  };

  const formConfig = {
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

    EjemploModel: [
      { name: "id", label: "Id", component: "q-input" },
      { name: "name", label: "Nombre", component: "q-input" },
      { name: "price", label: "Precio", component: "q-input" },
      // Otros campos según el modelo...
    ],


    // Otros modelos y sus campos aquí...
  };

  const generateFormConfig = () => {
    if (
      modelName === "perfilconfiguracion" /*||
      modelName === "usuario"*/
    ) {

      mostrarFormIntegrado.value = true;

      // Utilizar el formulario genérico de observación
      return formConfig["genericodescripcion"] || [];
    } else {
      // Utilizar el formulario específico para el modelo
      return formConfig[modelName] || [];
    }
  };

  formFields.value = generateFormConfig();

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

      const _respuesta = await peticionService.eliminar(modelName, Object.assign({}, item.row), true, tituloVentanaeliminacion)

      getData();
      close();
    }
    catch (error) {

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

  const agregarRegistro = () =>{

    //mostrarContrasenia.value = true;
    formDialogModal.value = true;

  }

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

    let dataToSend = { ...editedItem.value };
    if (dataToSend.descripcion) {
       dataToSend.descripcion = dataToSend.descripcion.toUpperCase();
    }

    //ACTUALIZARE REGISTRO
    let _respuesta

    if (editedIndex.value > -1) {


      if (modelName === "usuario"){
        delete dataToSend.clave;
      }


      _respuesta = await peticionService.actualizar(modelName, dataToSend)

    } else {

      //CREAR NUEVO REGISTRO

        _respuesta = await peticionService.crear(modelName, dataToSend)

    }

    console.log(_respuesta)

    if (!_respuesta.status){

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
    formTitle


  };
}
