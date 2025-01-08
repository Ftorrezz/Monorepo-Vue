import { ref } from "vue";
import NdPeticionControl from "src/controles/rest.control";
import { exportFile } from "quasar";
import NdAlertasControl from "src/controles/alertas.control";

export default function useCrud(modelName) {
  const tableData = ref([]);
  const tableColumns = ref([]);
  let filter = ref("");
  let alertas = new NdAlertasControl;

  const columnConfig = {
    perfilconfiguracion: ["id", "descripcion", "activo"],
    ProductModel: ["id", "name", "price"],
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
          name: "price",
          label: "Precio",
          field: "price",
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

  const getData = async () => {
    try {
      const _peticion = new NdPeticionControl();

      const _respuesta = await _peticion.invocarMetodo(modelName, "get");

      const modelColumns = generateColumnsConfig(modelName);

      // Asignar las columnas basadas en la configuración del modelo
      tableColumns.value = modelColumns;

      tableData.value = _respuesta;
    } catch (error) {
        alertas.mostrarMensaje('error', modelName, 'Error al obtener los datos de la tabla') 
        
    }
  };

  // Llama a la función para obtener los datos cuando se carga el composable
  getData();
  
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

    if (status !== true) alertas.mostrarMensaje('advertencia', 'Exportar', 'El navegador a denegado el acceso para la descarga ...')  
    else alertas.mostrarMensaje('verificacion', 'Exportar', 'Archivo generado correctamente')  
    
  };

  function wrapCsvValue(val, formatFn, row) {
    let formatted = formatFn !== void 0 ? formatFn(val, row) : val;

    formatted =
      formatted === void 0 || formatted === null ? "" : String(formatted);

    formatted = formatted.split('"').join('""');
    
    return `"${formatted}"`;
  }

  return {
    tableData,
    tableColumns,
    filter,
    exportTable
  };
}
