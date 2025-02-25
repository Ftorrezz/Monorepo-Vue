export default {
    descripcionsistema: 'Sistema integral de gestión hospitalaria',
    login: 'Iniciar sesión',
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
      home: 'Inicio',
      settings: {
        title: 'Configuración',
        institutional: {
          title: 'Institucional',
          entity: 'Sitio',
          entityconf: 'Sitio Configuración',
          branch: 'Sucursal',
          type: 'Tipo de Sitio Ubicación',
          location: 'Sitio Ubicación'
        },
        security: {
          title: 'Seguridad',
          access: 'Accesos',
          users: 'Usuarios',
          profiles: 'Perfiles',
          user: 'Usuario',
          profile: 'Perfil',
          role: 'Rol'
        },
        admin: {
          title: 'Administrador',
          config: 'Configuración'
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
    }
  };
