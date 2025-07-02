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
  // Agrega más configuraciones para otros modelos aquí...
};
