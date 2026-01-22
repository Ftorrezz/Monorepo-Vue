// menuConfig.js - Configuración con claves de traducción i18n
export const menuConfig = [
  {
    labelKey: "mainMenu.home.title",
    icon: "home",
    defaultopened: true,
    items: [
      {
        labelKey: "mainMenu.home.dashboard",
        icon: "dashboard",
        to: "/",
      },
      {
        labelKey: "mainMenu.home.ownerPet",
        icon: "person",
        to: "/propietariomascota",
      },
      {
        labelKey: "mainMenu.home.petCare",
        icon: "pets",
        to: "/atencionpaciente",
      },
      {
        labelKey: "mainMenu.home.schedule",
        icon: "calendar_month",
        to: "/agenda",
      },
    ],
  },
  {
    labelKey: "mainMenu.inventory.title",
    icon: "inventory",
    to: "/inventario",
  },
  {
    labelKey: "mainMenu.boarding.title",
    icon: "bedroom_baby",
    to: "/pension",
  },
  {
    labelKey: "mainMenu.sales.title",
    icon: "point_of_sale",
    to: "/ventas",
  },
  {
    labelKey: "mainMenu.reports.title",
    icon: "analytics",
    defaultopened: false,
    items: [
      /*
      {
        labelKey: "mainMenu.reports.basic.title",
        icon: "bar_chart",
        subItems: [
          { labelKey: "mainMenu.reports.basic.dailySales", icon: "today", to: "/reportes/ventas-diarias" },
          { labelKey: "mainMenu.reports.basic.activeClients", icon: "people", to: "/reportes/clientes-activos" },
          { labelKey: "mainMenu.reports.basic.popularServices", icon: "trending_up", to: "/reportes/servicios-populares" },
        ],
      },
      {
        labelKey: "mainMenu.reports.advanced.title",
        icon: "insights",
        subItems: [
          {
            labelKey: "mainMenu.reports.advanced.financial.title",
            icon: "attach_money",
            subItems: [
              { labelKey: "mainMenu.reports.advanced.financial.monthlyIncome", icon: "monetization_on", to: "/reportes/ingresos-mensuales" },
              { labelKey: "mainMenu.reports.advanced.financial.operatingExpenses", icon: "money_off", to: "/reportes/gastos-operativos" },
              { labelKey: "mainMenu.reports.advanced.financial.serviceProfitability", icon: "assessment", to: "/reportes/rentabilidad" },
            ]
          },
          {
            labelKey: "mainMenu.reports.advanced.clientMetrics.title",
            icon: "person_search",
            subItems: [
              { labelKey: "mainMenu.reports.advanced.clientMetrics.retention", icon: "favorite", to: "/reportes/retencion" },
              { labelKey: "mainMenu.reports.advanced.clientMetrics.satisfaction", icon: "sentiment_very_satisfied", to: "/reportes/satisfaccion" },
              { labelKey: "mainMenu.reports.advanced.clientMetrics.visitFrequency", icon: "schedule", to: "/reportes/frecuencia" },
            ]
          },
        ],
      },*/
      {
        labelKey: "mainMenu.reports.exportData",
        icon: "file_download",
        to: "/reportes",
      },
    ],
  },
  {
    labelKey: "mainMenu.settings.title",
    icon: "settings",
    defaultopened: false,
    items: [
      {
        labelKey: "mainMenu.settings.schedule.title",
        icon: "calendar_month",
        subItems: [
          { labelKey: "mainMenu.settings.schedule.service", icon: "schedule", to: "/agendaservicio" },
          { labelKey: "Generar Agenda", icon: "autorenew", to: "/generar-agenda" },
          //{ labelKey: "mainMenu.settings.schedule.configureHours", icon: "schedule", to: "/config/horarios" },
          //{ labelKey: "mainMenu.settings.schedule.holidays", icon: "event", to: "/config/festivos" },
          { labelKey: "mainMenu.settings.schedule.reminders", icon: "notification_important", to: "/config/recordatorios" },
        ],
      },
      {
        labelKey: "mainMenu.settings.general.title",
        icon: "tune",
        subItems: [
          {
            labelKey: "mainMenu.settings.general.services.title",
            icon: "medical_services",
            subItems: [
              { labelKey: "mainMenu.settings.general.services.types", icon: "category", to: "/config/tipos-servicio" },
              { labelKey: "mainMenu.settings.general.services.prices", icon: "local_atm", to: "/config/precios" },
              { labelKey: "mainMenu.settings.general.services.duration", icon: "timer", to: "/config/duracion" },
            ]
          },
          { labelKey: "mainMenu.settings.general.location", icon: "place", to: "/config/ubicacion" },
          {
            labelKey: "mainMenu.settings.general.staff.title",
            icon: "group",
            subItems: [
              { labelKey: "mainMenu.settings.general.staff.professionals", icon: "person", to: "/config/profesionales" },
              { labelKey: "mainMenu.settings.general.staff.specialties", icon: "star", to: "/config/especialidades" },
              { labelKey: "mainMenu.settings.general.staff.workHours", icon: "access_time", to: "/config/horarios-personal" },
              { labelKey: "mainMenu.settings.general.staff.permissions", icon: "security", to: "/config/permisos" },
            ]
          },
          {
            labelKey: "mainMenu.settings.general.profesional.title",
            icon: "person",
            subItems: [
              { labelKey: "mainMenu.settings.general.profesional.profesional", icon: "person", to: "/profesional" },
              { labelKey: "mainMenu.settings.general.profesional.tipoprofesional", icon: "person", to: "/tipoprofesional" },

            ]
          },
        ],
      },
      {
        labelKey: "mainMenu.settings.pet.title",
        icon: "pets",
        subItems: [

          { labelKey: "mainMenu.settings.pet.physical.color", icon: "color_lens", to: "/config/mascota/color" },
          { labelKey: "mainMenu.settings.pet.physical.breed", icon: "pets", to: "/config/mascota/razamascota" },
          { labelKey: "mainMenu.settings.pet.biological.species", icon: "category", to: "/config/mascota/especie" },
          { labelKey: "mainMenu.settings.pet.biological.sex", icon: "wc", to: "/config/mascota/sexo" },
          { labelKey: "mainMenu.settings.pet.behavior.character", icon: "sentiment_satisfied", to: "/config/mascota/caracter" },
          { labelKey: "mainMenu.settings.pet.care.diet", icon: "restaurant", to: "/config/mascota/dieta" },
          { labelKey: "mainMenu.settings.pet.care.habitat", icon: "home", to: "/config/mascota/habitat" },
        ],
      },
      {
        labelKey: "mainMenu.settings.owner.title",
        icon: "person",
        subItems: [
          {
            labelKey: "mainMenu.settings.owner.personal.title",
            icon: "account_circle",
            subItems: [
              { labelKey: "mainMenu.settings.owner.personal.gender", icon: "wc", to: "/config/propietario/genero" },
              { labelKey: "mainMenu.settings.owner.personal.maritalStatus", icon: "favorite", to: "/config/propietario/estadocivil" },
              { labelKey: "mainMenu.settings.owner.academic.education", icon: "menu_book", to: "/config/propietario/escolaridad" },
              { labelKey: "mainMenu.settings.owner.academic.profession", icon: "work", to: "/config/propietario/ocupacion" },
              { labelKey: "mainMenu.settings.owner.cultural.religion", icon: "church", to: "/config/propietario/religion" },
              { labelKey: "mainMenu.settings.owner.cultural.raza", icon: "wc", to: "/config/propietario/raza" },

            ]
          }
        ],
      },
      {
        labelKey: "mainMenu.settings.institutional.title",
        icon: "key",
        subItems: [
          { labelKey: "mainMenu.settings.institutional.site", icon: "note_add", to: "/sitio" },
          { labelKey: "mainMenu.settings.institutional.entityconf", icon: "note_add", to: "/configuracion" },
          { labelKey: "mainMenu.settings.institutional.siteLocationType", icon: "note_add", to: "/tipositioubicacion" },
          { labelKey: "mainMenu.settings.institutional.siteLocation", icon: "note_add", to: "/sitioubicacion" },
          { labelKey: "mainMenu.settings.institutional.branch", icon: "note_add", to: "/sucursal" },
        ],
      },
      {
        labelKey: "mainMenu.settings.inventory.title",
        icon: "key",
        subItems: [
          { labelKey: "mainMenu.settings.inventory.category", icon: "note_add", to: "/inventario/categoria" },
          { labelKey: "mainMenu.settings.inventory.brand", icon: "note_add", to: "/inventario/marca" },
          { labelKey: "mainMenu.settings.inventory.product", icon: "note_add", to: "/inventario/producto" },
          { labelKey: "mainMenu.settings.inventory.productType", icon: "note_add", to: "/productotipo" },
          { labelKey: "Proveedores", icon: "business", to: "/inventario/proveedor" },

        ],
      },
      {
        labelKey: "mainMenu.settings.system.title",
        icon: "computer",
        subItems: [
          {
            labelKey: "mainMenu.settings.system.usersPermissions.title",
            icon: "admin_panel_settings",
            subItems: [
              { labelKey: "mainMenu.settings.system.usersPermissions.userManagement", icon: "people", to: "/config/usuarios" },
              { labelKey: "mainMenu.settings.system.usersPermissions.roles", icon: "security", to: "/config/roles" },
              { labelKey: "mainMenu.settings.system.usersPermissions.permissions", icon: "lock", to: "/config/permisos" },
            ]
          },
          {
            labelKey: "mainMenu.settings.system.templates.title",
            icon: "description",
            subItems: [
              { labelKey: "mainMenu.settings.system.templates.consultation", icon: "note_add", to: "/config/plantillas-consulta" },
              { labelKey: "mainMenu.settings.system.templates.report", icon: "article", to: "/config/plantillas-reporte" },
              { labelKey: "mainMenu.settings.system.templates.certificates", icon: "verified", to: "/templatemanager" },
            ]
          },
          {
            labelKey: "mainMenu.settings.system.backups.title",
            icon: "backup",
            subItems: [
              { labelKey: "mainMenu.settings.system.backups.create", icon: "save", to: "/config/crear-respaldo" },
              { labelKey: "mainMenu.settings.system.backups.restore", icon: "restore", to: "/config/restaurar" },
              { labelKey: "mainMenu.settings.system.backups.schedule", icon: "schedule", to: "/config/programar-respaldos" },
            ]
          },
          { labelKey: "mainMenu.settings.system.general", icon: "settings", to: "/config/general" },
        ],
      },
      {
        labelKey: "mainMenu.settings.security.title",
        icon: "key",
        subItems: [
          {
            labelKey: "mainMenu.settings.security.user.title",
            icon: "person",
            subItems: [
              { labelKey: "mainMenu.settings.security.user.user", icon: "note_add", to: "/usuario" },
              { labelKey: "mainMenu.settings.security.user.profile", icon: "article", to: "/usuarioperfil" },
              { labelKey: "mainMenu.settings.security.user.access", icon: "verified", to: "/usuarioacceso" },
            ]
          },
        ],
      },
    ],
  },
  {
    labelKey: "mainMenu.help.title",
    icon: "help",
    items: [
      {
        labelKey: "mainMenu.help.documentation",
        icon: "description",
        to: "/ayuda/documentacion",
      },
      {
        labelKey: "mainMenu.help.tutorials.title",
        icon: "play_circle",
        subItems: [
          { labelKey: "mainMenu.help.tutorials.introVideos", icon: "video_library", to: "/ayuda/videos-intro" },
          { labelKey: "mainMenu.help.tutorials.stepByStep", icon: "list_alt", to: "/ayuda/guias" },
          { labelKey: "mainMenu.help.tutorials.useCases", icon: "lightbulb", to: "/ayuda/casos-uso" },
        ],
      },
      {
        labelKey: "mainMenu.help.support",
        icon: "support_agent",
        to: "/ayuda/soporte",
      },
    ],
  },
  {
    labelKey: "mainMenu.conf.title",
    icon: "help",
    items: [
      {
        labelKey: "mainMenu.modulo.documentation",
        icon: "description",
        to: "/configuracionmodulo",
      },

      {
        labelKey: "mainMenu.valor.support",
        icon: "support_agent",
        to: "/configuracionvalor",
      },
      {
        labelKey: "mainMenu.campo.support",
        icon: "support_agent",
        to: "/configuracioncampo",
      },
    ],
  },
];