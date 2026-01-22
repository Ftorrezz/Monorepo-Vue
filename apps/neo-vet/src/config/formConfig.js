export const formConfig = {
  genericoDescripcion: [
    /*{
      name: "id",
      label: "id",
      component: "q-input",
      classes: ["q-mb-xs"],
      visible: false,
    },*/
    {
      name: "descripcion",
      label: "Descripción",
      component: "q-input",
      classes: ["q-mb-xs uppercase"],
      rules: [
        (val) =>
          (val && val.length > 0) || "Ingrese la descripción",
      ],
      visible: true,
    },
    {
      name: "paridad",
      label: "Paridad",
      component: "q-input",
      classes: ["q-mb-xs"],
      visible: true,
    },
    {
      name: "activo",
      label: "Activo",
      component: "q-checkbox",
      classes: ["q-mb-xs"],
      visible: true,
    },
  ],
  sexo: [
    {
      name: "descripcion",
      label: "Descripción",
      component: "q-input",
      classes: ["q-mb-xs uppercase"],
      rules: [
        (val) =>
          (val && val.length > 0) || "Ingrese la descripción",
      ],
    },
    {
      name: "identificador",
      label: "Identificador",
      component: "q-input",
      classes: ["q-mb-xs"],
      rules: [
        (val) =>
          (val && val.length > 0) || "Ingrese un identificador",
      ],
    },
    {
      name: "paridad",
      label: "Paridad",
      component: "q-input",
      classes: ["q-mb-xs"]
    },
    {
      name: "activo",
      label: "Activo",
      component: "q-checkbox",
      classes: ["q-mb-xs"],
    },
  ],
  diagnostico: [
    {
      name: "descripcion",
      label: "Descripción",
      component: "q-input",
      classes: ["q-mb-xs uppercase"],
      rules: [
        (val) =>
          (val && val.length > 0) || "Ingrese la descripción",
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
    {
      name: "causamuerte",
      label: "Causa Muerte",
      component: "q-checkbox",
      classes: ["q-mb-xs"],
    },
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
      //options: sitios.value,
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
      //options: sitios.value,
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

  tipositioubicacion: [
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
      name: "identificador",
      label: "Identificador",
      component: "q-input",
      classes: ["q-mb-xs"],
      rules: [
        (val) =>
          (val && val.length > 0) || "Ingrese el identificador del tipo de ubicación",
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
      //options: sitios.value,
      rules: [(val) => !!val || "Seleccione un sitio"],
      //rules: [(val) => (val && val.length > 0) || "Seleccione un sitio"]
    },
    {
      name: "id_tipositioubicacion",
      label: "Sitio Ubicación",
      component: "q-select",
      classes: ["q-mb-xs"],
      //options: _listaTipoSitioUbicacion.value,
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
  generoconfiguracion: [
    {
      name: "descripcion",
      label: "Descripción",
      component: "q-input",
      classes: ["q-mb-xs uppercase"],
      rules: [
        (val) =>
          (val && val.length > 0) || "Ingrese la descripción",
      ],
    },
    {
      name: "identificador",
      label: "Identificador",
      component: "q-input",
      classes: ["q-mb-xs"],
      rules: [
        (val) =>
          (val && val.length > 0) || "Ingrese un identificador",
      ],
    },
    {
      name: "paridad",
      label: "Paridad",
      component: "q-input",
      classes: ["q-mb-xs"]
    },
    {
      name: "activo",
      label: "Activo",
      component: "q-checkbox",
      classes: ["q-mb-xs"],
    },
  ],

  // Agrega más configuraciones para otros modelos aquí...
};
