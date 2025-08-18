export const menuConfig = [
  {
    label: "Inicio",
    icon: "home",
    defaultopened: false,    
    items: [
      {
        label: "Tablero",
        icon: "dashboard",
        to: "/",
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
    icon: "analytics",
    defaultopened: false,
    items: [
      {
        label: "Reportes Básicos",
        icon: "bar_chart",
        subItems: [
          { label: "Ventas Diarias", icon: "today", to: "/reportes/ventas-diarias" },
          { label: "Clientes Activos", icon: "people", to: "/reportes/clientes-activos" },
          { label: "Servicios Populares", icon: "trending_up", to: "/reportes/servicios-populares" },
        ],
      },
      {
        label: "Reportes Avanzados",
        icon: "insights",
        subItems: [
          { 
            label: "Análisis Financiero", 
            icon: "attach_money", 
            subItems: [
              { label: "Ingresos Mensuales", icon: "monetization_on", to: "/reportes/ingresos-mensuales" },
              { label: "Gastos Operativos", icon: "money_off", to: "/reportes/gastos-operativos" },
              { label: "Rentabilidad por Servicio", icon: "assessment", to: "/reportes/rentabilidad" },
            ]
          },
          { 
            label: "Métricas de Cliente", 
            icon: "person_search", 
            subItems: [
              { label: "Retención de Clientes", icon: "favorite", to: "/reportes/retencion" },
              { label: "Satisfacción", icon: "sentiment_very_satisfied", to: "/reportes/satisfaccion" },
              { label: "Frecuencia de Visitas", icon: "schedule", to: "/reportes/frecuencia" },
            ]
          },
        ],
      },
      {
        label: "Exportar Datos",
        icon: "file_download",
        to: "/reportes/exportar",
      },
    ],
  },
  {
    label: "Configuración",
    icon: "settings",
    defaultopened: false,
    items: [
      {
        label: "Agenda",
        icon: "calendar_month",
        subItems: [
          { label: "Configurar Horarios", icon: "schedule", to: "/config/horarios" },
          { label: "Días Festivos", icon: "event", to: "/config/festivos" },
          { label: "Recordatorios", icon: "notification_important", to: "/config/recordatorios" },
        ],
      },
      {
        label: "General",
        icon: "tune",
        subItems: [
          { 
            label: "Servicios", 
            icon: "medical_services", 
            subItems: [
              { label: "Tipos de Servicio", icon: "category", to: "/config/tipos-servicio" },
              { label: "Precios", icon: "local_atm", to: "/config/precios" },
              { label: "Duración", icon: "timer", to: "/config/duracion" },
            ]
          },
          { label: "Ubicación", icon: "place", to: "/config/ubicacion" },
          { 
            label: "Personal", 
            icon: "group", 
            subItems: [
              { label: "Profesionales", icon: "person", to: "/config/profesionales" },
              { label: "Especialidades", icon: "star", to: "/config/especialidades" },
              { label: "Horarios de Trabajo", icon: "access_time", to: "/config/horarios-personal" },
              { label: "Permisos", icon: "security", to: "/config/permisos" },
            ]
          },
        ],
      },
      {
        label: "Mascota",
        icon: "pets",
        subItems: [
          {
            label: "Características Físicas",
            icon: "palette",
            subItems: [
              { label: "Color", icon: "color_lens", to: "/config/color" },
              { label: "Raza", icon: "pets", to: "/config/raza" },
              { label: "Tamaño", icon: "straighten", to: "/config/tamaño" },
            ]
          },
          {
            label: "Información Biológica",
            icon: "biotech",
            subItems: [
              { label: "Especie", icon: "category", to: "/config/especie" },
              { label: "Sexo", icon: "wc", to: "/config/sexo" },
              { label: "Edad", icon: "cake", to: "/config/edad" },
            ]
          },
          {
            label: "Comportamiento",
            icon: "psychology",
            subItems: [
              { label: "Carácter", icon: "sentiment_satisfied", to: "/config/caracter" },
              { label: "Nivel de Actividad", icon: "fitness_center", to: "/config/actividad" },
              { label: "Socialización", icon: "groups", to: "/config/socializacion" },
            ]
          },
          {
            label: "Cuidados",
            icon: "health_and_safety",
            subItems: [
              { label: "Dieta", icon: "restaurant", to: "/config/dieta" },
              { label: "Habitat", icon: "home", to: "/config/habitat" },
              { label: "Ejercicio", icon: "directions_run", to: "/config/ejercicio" },
            ]
          },
        ],
      },
      {
        label: "Propietario",
        icon: "person",
        subItems: [
          {
            label: "Información Personal",
            icon: "account_circle",
            subItems: [
              { label: "Género", icon: "wc", to: "/config/genero" },
              { label: "Estado Civil", icon: "favorite", to: "/config/estado-civil" },
              { label: "Edad", icon: "cake", to: "/config/edad-propietario" },
            ]
          },
          {
            label: "Información Académica",
            icon: "school",
            subItems: [
              { label: "Escolaridad", icon: "menu_book", to: "/config/escolaridad" },
              { label: "Profesión", icon: "work", to: "/config/profesion" },
              { label: "Área de Trabajo", icon: "business", to: "/config/area-trabajo" },
            ]
          },
          {
            label: "Información Cultural",
            icon: "public",
            subItems: [
              { label: "Religión", icon: "church", to: "/config/religion" },
              { label: "Idioma", icon: "translate", to: "/config/idioma" },
              { label: "Nacionalidad", icon: "flag", to: "/config/nacionalidad" },
            ]
          },
        ],
      },
      {
        label: "Sistema",
        icon: "computer",
        subItems: [
          {
            label: "Usuarios y Permisos",
            icon: "admin_panel_settings",
            subItems: [
              { label: "Gestión de Usuarios", icon: "people", to: "/config/usuarios" },
              { label: "Roles", icon: "security", to: "/config/roles" },
              { label: "Permisos", icon: "lock", to: "/config/permisos" },
            ]
          },
          {
            label: "Plantillas",
            icon: "description",
            subItems: [
              { label: "Plantillas de Consulta", icon: "note_add", to: "/config/plantillas-consulta" },
              { label: "Plantillas de Reporte", icon: "article", to: "/config/plantillas-reporte" },
              { label: "Certificados", icon: "verified", to: "/templatemanager" },
            ]
          },
          {
            label: "Respaldos",
            icon: "backup",
            subItems: [
              { label: "Crear Respaldo", icon: "save", to: "/config/crear-respaldo" },
              { label: "Restaurar", icon: "restore", to: "/config/restaurar" },
              { label: "Programar Respaldos", icon: "schedule", to: "/config/programar-respaldos" },
            ]
          },
          { label: "Configuración General", icon: "settings", to: "/config/general" },
        ],
      },
    ],
  },
  {
        label: "Inventario",
        icon: "edit",
        to: "/inventario",
        
        
      },
  {
    label: "Ayuda",
    icon: "help",
    items: [
      {
        label: "Documentación",
        icon: "description",
        to: "/ayuda/documentacion",
      },
      {
        label: "Tutoriales",
        icon: "play_circle",
        subItems: [
          { label: "Videos Introductorios", icon: "video_library", to: "/ayuda/videos-intro" },
          { label: "Guías Paso a Paso", icon: "list_alt", to: "/ayuda/guias" },
          { label: "Casos de Uso", icon: "lightbulb", to: "/ayuda/casos-uso" },
        ],
      },
      {
        label: "Soporte",
        icon: "support_agent",
        to: "/ayuda/soporte",
      },
    ],
  },
];