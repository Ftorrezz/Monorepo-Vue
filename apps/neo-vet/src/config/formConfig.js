export const formConfig = {
  genericoDescripcion: [
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
  color: [
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
  // Agrega más configuraciones para otros modelos aquí...
};
