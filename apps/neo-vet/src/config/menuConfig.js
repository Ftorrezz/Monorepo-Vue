export const menuConfig = [
  {
    label: "Inicio",
    icon: "home",
    defaultopened: false,    
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
        label: "Atención Mascota",
        icon: "pets",
        to: "/atencionpaciente",
      },
      {
        label: "Agenda",
        icon: "calendar_month",
        to: "/agenda",
      },
    ],
  },
  {
    label: "Reportes",
    icon: "print",
    defaultopened: false,
    to: "/reportes",
    
  },
  {
    label: "Configuración",
    icon: "settings",
    items: [
      {
        label: "Agenda",
        icon: "calendar_month",
        subItems: [
          { label: "Agenda", icon: "send", to: "/agenda" },
          
        ],
      },
      {
        label: "General",
        icon: "view_timeline",
        subItems: [
          { label: "Servicio", icon: "send", to: "/servicio" },
          { label: "Ubicación", icon: "send", to: "/ubicacion" },
          { label: "Profesional", icon: "send", to: "/profesional" },
          { label: "Tipo de Profesional", icon: "send", to: "/tipoprofesional" },

        ],
      },
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
          { label: "Género", icon: "send", to: "/genero" },
        ],
      },
    ],
  },
];
