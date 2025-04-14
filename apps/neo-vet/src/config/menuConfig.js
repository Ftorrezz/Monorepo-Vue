export const menuConfig = [
  {
    label: "Inicio",
    icon: "home",
    items: [
      {
        label: "Tablero",
        icon: "dashboard",
        to: "/", // Ruta para el tablero
      },
      {
        label: "Propietario / Mascota",
        icon: "person",
        to: "/propietariomascota",
      },
      {
        label: "Agenda",
        icon: "calendar_month",
        to: "/agenda",
      },
    ],
  },
  {
    label: "Configuración",
    icon: "settings",
    items: [
      {
        label: "Mascota",
        icon: "pets",
        subItems: [
          { label: "Color", icon: "send", to: "/color" },
          { label: "Raza", icon: "send", to: "/razamascota" },
          { label: "Especie", icon: "send", to: "/especie" },
          { label: "Sexo", icon: "send", to: "/sexo" },
          { label: "Habitat", icon: "send", to: "/habitat" },
          { label: "Carácter", icon: "send", to: "/caracter" },
          { label: "Dieta", icon: "send", to: "/dieta" },
          { label: "Especialidad", icon: "send", to: "/especialidad" },
        ],
      },
      {
        label: "Propietario",
        icon: "person",
        subItems: [
          { label: "Escolaridad", icon: "send", to: "/escolaridad" },
          { label: "Estado Civil", icon: "send", to: "/estadocivil" },
          { label: "Ocupación", icon: "send", to: "/ocupacion" },
          { label: "Raza", icon: "send", to: "/raza" },
          { label: "Religión", icon: "send", to: "/religion" },
        ],
      },
    ],
  },
];
