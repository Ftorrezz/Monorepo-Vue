export default {
  descripcionsistema: 'Sistema integral de gestión veterinaria',
  descripcionsistemalargo: 'NeoVET : : Sistema integral de gestión veterinaria',
  login: 'Iniciar Sesión',
  forgotPassword: "¿Olvidó la clave?",
  cerrarsesion: 'Cerrar sesion',
  continuar: 'Continuar',
  desbloquear: 'Desbloquear',
  inputlogin: {
    label: 'Usuario / correo electrónico',
    validation: 'Por favor, ingrese un usuario o correo electrónico',
    labelpassword: 'Contraseña',
    validationpassword: 'Por favor, ingrese una contraseña',
  },
  pantallabloqueo: {
    descripcion: 'Sesión bloqueada por inactividad',
    label: 'Contraseña para desbloquear',
    validation: 'Por favor, ingrese una contraseña',
  },
  footer: {
    selectBranch: 'Seleccione una sucursal',
    address: 'Dirección',
    manager: 'Responsable',
    copyright: 'Todos los derechos reservados'
  },
  modules: {
    hospitalManagement: 'Gestión Hospitalaria',
    laboratory: 'Laboratorio',
    qualityControl: 'Control de Calidad',
    inventory: 'Inventario',
    pharmacy: 'Farmacia',
    appointments: 'Citas',
    shiftManager: 'Gestor de Turnos',
    errors: {
      invalidUrl: 'URL inválida',
      undefined: 'URL de destino indefinida',
      accessError: 'Error al verificar acceso'
    }
  },
  mainMenu: {
    home: {
      title: 'Inicio',
      dashboard: 'Tablero',
      ownerPet: 'Propietario / Mascota',
      petCare: 'Atención Mascota',
      schedule: 'Calendario'
    },
    inventory: {
      title: 'Inventario'
    },
    boarding: {
      title: 'Pensión'
    },
    sales: {
      title: 'Ventas'
    },
    reports: {
      title: 'Reportes',
      basic: {
        title: 'Reportes Básicos',
        dailySales: 'Ventas Diarias',
        activeClients: 'Clientes Activos',
        popularServices: 'Servicios Populares'
      },
      advanced: {
        title: 'Reportes Avanzados',
        financial: {
          title: 'Análisis Financiero',
          monthlyIncome: 'Ingresos Mensuales',
          operatingExpenses: 'Gastos Operativos',
          serviceProfitability: 'Rentabilidad por Servicio'
        },
        clientMetrics: {
          title: 'Métricas de Cliente',
          retention: 'Retención de Clientes',
          satisfaction: 'Satisfacción',
          visitFrequency: 'Frecuencia de Visitas'
        }
      },
      exportData: 'Exportar Datos'
    },
    settings: {
      title: 'Configuración',
      schedule: {
        title: 'Agenda',
        service: 'Servicio',
        configureHours: 'Horarios de Atención',
        holidays: 'Días Festivos',
        reminders: 'Recordatorios',
        citaMotivo: 'Motivo de Cita'
      },
      general: {
        title: 'General',
        location: 'Ubicación',
        services: {
          title: 'Servicios',
          types: 'Tipos de Servicio',
          prices: 'Precios',
          duration: 'Duración'
        },
        staff: {
          title: 'Personal',
          professionals: 'Profesionales',
          specialties: 'Especialidades',
          workHours: 'Horarios de Trabajo',
          permissions: 'Permisos'
        },
        profesional: {
          title: 'Profesional',
          profesional: 'Profesional',
          tipoprofesional: 'Tipo Profesional'

        },
      },
      pet: {
        title: 'Mascota',
        physical: {
          title: 'Características Físicas',
          color: 'Color',
          breed: 'Raza',
          size: 'Tamaño'
        },
        biological: {
          title: 'Información Biológica',
          species: 'Especie',
          sex: 'Sexo',
          age: 'Edad'
        },
        behavior: {
          title: 'Comportamiento',
          character: 'Carácter',
          activityLevel: 'Nivel de Actividad',
          socialization: 'Socialización'
        },
        care: {
          title: 'Cuidados',
          diet: 'Dieta',
          habitat: 'Hábitat',
          exercise: 'Ejercicio'
        }
      },
      owner: {
        title: 'Propietario',
        personal: {
          title: 'Información Personal',
          gender: 'Género',
          maritalStatus: 'Estado Civil',
          age: 'Edad'
        },
        academic: {
          title: 'Información Académica',
          education: 'Escolaridad',
          profession: 'Profesión',
          workArea: 'Área de Trabajo'
        },
        cultural: {
          title: 'Información Cultural',
          religion: 'Religión',
          language: 'Idioma',
          nationality: 'Nacionalidad'
        }
      },
      institutional: {
        title: 'Institucional',
        site: 'Sitio',
        entityconf: 'Sitio Configuración',
        siteLocationType: 'Tipo Sitio Ubicación',
        siteLocation: 'Sitio Ubicación',
        branch: 'Sucursal'
      },
      system: {
        title: 'Sistema',
        general: 'Configuración General',
        usersPermissions: {
          title: 'Usuarios y Permisos',
          userManagement: 'Gestión de Usuarios',
          roles: 'Roles',
          permissions: 'Permisos'
        },
        templates: {
          title: 'Plantillas',
          consultation: 'Plantillas de Consulta',
          report: 'Plantillas de Reporte',
          certificates: 'Certificados',
          management: 'Gestión de Plantillas'
        },
        backups: {
          title: 'Respaldos',
          create: 'Crear Respaldo',
          restore: 'Restaurar',
          schedule: 'Programar Respaldos'
        }
      },
      security: {
        title: 'Seguridad',
        user: {
          title: 'Usuario',
          user: 'Usuario',
          profile: 'Perfil',
          access: 'Acceso'
        }
      }
    },
    help: {
      title: 'Ayuda',
      documentation: 'Documentación',
      support: 'Soporte',
      tutorials: {
        title: 'Tutoriales',
        introVideos: 'Videos Introductorios',
        stepByStep: 'Guías Paso a Paso',
        useCases: 'Casos de Uso'
      }
    }
  },
  userProfile: {
    title: 'Perfil de usuario',
    deleteTitle: 'Perfil',
    modelName: 'perfilconfiguracion'
  },
  userManagement: {
    title: 'Gestión de Usuarios',
    form: {
      title: 'Usuario',
      subtitle: 'Complete los datos del usuario',
      photo: {
        change: 'Cambiar foto',
        alt: 'Foto del usuario'
      },
      fields: {
        username: {
          label: 'Usuario',
          validation: 'Ingrese un nombre de usuario'
        },
        email: {
          label: 'Email',
          validation: {
            required: 'Ingrese un correo electrónico',
            invalid: 'Ingrese un correo válido'
          }
        },
        password: {
          label: 'Contraseña',
          validation: {
            required: 'Ingrese una contraseña',
            invalid: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número'
          }
        },
        profile: {
          label: 'Perfil',
          validation: 'Seleccione un perfil'
        },
        branch: {
          label: 'Sucursal',
          validation: 'Seleccione una sucursal'
        },
        status: {
          label: 'Estado',
          active: 'Activo',
          inactive: 'Inactivo'
        }
      }
    },
    table: {
      headers: {
        username: 'Usuario',
        email: 'Correo',
        profile: 'Perfil',
        branch: 'Sucursal',
        status: 'Estado',
        actions: 'Acciones'
      },
      noData: 'No hay datos disponibles'
    }
  },
  userMenu: {
    options: 'Opciones',
    changePassword: 'Cambiar contraseña',
    logout: 'Cerrar sesión',
    email: 'Correo electrónico',
    newPassword: 'Contraseña nueva',
    confirmPassword: 'Confirmar contraseña nueva',
    validation: {
      required: 'Este campo es requerido',
      validEmail: 'Ingrese un correo electrónico válido',
      passwordMatch: 'Las contraseñas no coinciden'
    }
  },
  darkMode: {
    toggleDark: 'Cambiar a modo oscuro',
    toggleLight: 'Cambiar a modo claro'
  },
  branchDialog: {
    title: 'Sucursales',
    subtitle: 'Por favor, seleccione la sucursal a la que desea ingresar',
    cancelButton: 'Cancelar ingreso',
    enterButton: 'Ingresar',
    imageAlt: 'Imagen de sucursal'
  },
  passwordRecovery: {
    steps: {
      recovery: 'Recuperación de clave',
      sending: 'Enviando correo electrónico',
      update: 'Actualizar clave',
      finish: 'Finalización'
    },
    labels: {
      user: 'Usuario',
      recoveryCode: 'Código de recuperación',
      newPassword: 'Contraseña nueva',
      repeatNewPassword: 'Repetir contraseña nueva'
    },
    messages: {
      instructions: 'Si presiona el botón continuar, se le enviará un correo electrónico con un código de recuperación de clave a la casilla de correo asociada al usuario, luego se le indicarán los pasos a seguir.',
      sending: 'Le estamos enviando el correo, por favor espere y le avisaremos cuando el proceso finalice.',
      enterCode: 'Por favor ingrese el código de recuperación recibido y su nueva clave.',
      sendingStatus: 'Enviando...',
      finish: 'La clave fue actualizada exitosamente, presione finalizar para terminar con el proceso y volver al inicio.'
    },
    validation: {
      recoveryCode: 'Por favor, ingrese el código de recuperación',
      password: 'Por favor, ingrese una contraseña',
      repeatPassword: 'Por favor, ingrese la confirmación de la contraseña'
    },
    buttons: {
      continue: 'Continuar',
      cancel: 'Cancelar',
      update: 'Actualizar clave',
      finish: 'Finalizar'
    }
  },
  plantillas: {
    titulo: 'Gestión de Plantillas',
    nueva: 'Nueva Plantilla',
    editar: 'Editar Plantilla',
    guardar: 'Guardar Plantilla',
    variables: 'Variables Dinámicas',
    contenido: 'Contenido HTML',
    configuracion: 'Configuración de Página',
    preview: 'Vista Previa',
    exportar: 'Exportar PDF',
    mensajes: {
      guardadoOk: 'Plantilla guardada exitosamente',
      errorGuardar: 'Error al guardar la plantilla',
      confirmarEliminar: '¿Estás seguro de eliminar esta plantilla?',
      eliminadoOk: 'Plantilla eliminada'
    }
  }
};
