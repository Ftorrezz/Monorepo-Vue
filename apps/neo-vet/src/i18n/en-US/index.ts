export default {
  descripcionsistema: 'Comprehensive veterinary management system',
  descripcionsistemalargo: 'NeoVET : : Comprehensive veterinary management system',
  login: 'Start session',
  forgotPassword: "Forgot your password?",
  cerrarsesion: 'Log out',
  continuar: 'Continue',
  desbloquear: 'Unlock',
  inputlogin: {
    label: 'User / Email',
    validation: 'Please enter a user or email',
    labelpassword: 'Password',
    validationpassword: 'Please enter a password',
  },
  pantallabloqueo: {
     descripcion: 'Session locked due to inactivity',
     label: 'Password to unlock',
     validation: 'Please enter a password',
  },
  footer: {
    selectBranch: 'Select a branch',
    address: 'Address',
    manager: 'Manager',
    copyright: 'All rights reserved'
  },
  modules: {
    hospitalManagement: 'Hospital Management',
    laboratory: 'Laboratory',
    qualityControl: 'Quality Control',
    inventory: 'Inventory',
    pharmacy: 'Pharmacy',
    appointments: 'Appointments',
    shiftManager: 'Shift Manager',
    errors: {
      invalidUrl: 'Invalid URL',
      undefined: 'Undefined destination URL',
      accessError: 'Error verifying access'
    }
  },
  mainMenu: {
    home: 'Home',
    settings: {
      title: 'Settings',
      institutional: {
        title: 'Institutional',
        entity: 'Site',
        entityconf: 'Site Configuration',
        branch: 'Branch',
        type: 'Site Location Type',
        location: 'Site Location'
      },
      security: {
        title: 'Security',
        access: 'Access',
        users: 'Users',
        profiles: 'Profiles',
        user: 'User',
        profile: 'Profile',
        role: 'Role'
      },
      admin: {
        title: 'Administrator',
        config: 'Configuration'
      }
    }
  },
  userProfile: {
    title: 'User Profile',
    deleteTitle: 'Profile',
    modelName: 'perfilconfiguracion'
  },
  userManagement: {
    title: 'User Management',
    form: {
      title: 'User',
      subtitle: 'Complete the user information',
      photo: {
        change: 'Change photo',
        alt: 'User photo'
      },
      fields: {
        username: {
          label: 'Username',
          validation: 'Enter a username'
        },
        email: {
          label: 'Email',
          validation: {
            required: 'Enter an email address',
            invalid: 'Enter a valid email'
          }
        },
        password: {
          label: 'Password',
          validation: {
            required: 'Enter a password',
            invalid: 'Password must have at least 8 characters, one uppercase, one lowercase and one number'
          }
        },
        profile: {
          label: 'Profile',
          validation: 'Select a profile'
        },
        branch: {
          label: 'Branch',
          validation: 'Select a branch'
        },
        status: {
          label: 'Status',
          active: 'Active',
          inactive: 'Inactive'
        }
      }
    },
    table: {
      headers: {
        username: 'Username',
        email: 'Email',
        profile: 'Profile',
        branch: 'Branch',
        status: 'Status',
        actions: 'Actions'
      },
      noData: 'No data available'
    }
  },
  userMenu: {
    options: 'Options',
    changePassword: 'Change Password',
    logout: 'Log out',
    email: 'Email',
    newPassword: 'New Password',
    confirmPassword: 'Confirm New Password',
    validation: {
      required: 'This field is required',
      validEmail: 'Please enter a valid email',
      passwordMatch: 'Passwords do not match'
    }
  },
  darkMode: {
    toggleDark: 'Switch to dark mode',
    toggleLight: 'Switch to light mode'
  },
  branchDialog: {
    title: 'Branches',
    subtitle: 'Please select the branch you want to access',
    cancelButton: 'Cancel',
    enterButton: 'Enter',
    imageAlt: 'Branch image'
  },
  passwordRecovery: {
    steps: {
      recovery: 'Password Recovery',
      sending: 'Sending Email',
      update: 'Update Password',
      finish: 'Completion'
    },
    labels: {
      user: 'User',
      recoveryCode: 'Recovery Code',
      newPassword: 'New Password',
      repeatNewPassword: 'Repeat New Password'
    },
    messages: {
      instructions: 'If you press the continue button, an email with a recovery code will be sent to the email address associated with your user account. You will then be guided through the next steps.',
      sending: 'We are sending the email, please wait and we will notify you when the process is complete.',
      enterCode: 'Please enter the recovery code received and your new password.',
      sendingStatus: 'Sending...',
      finish: 'The password was successfully updated, press finish to complete the process and return to the start.'
    },
    validation: {
      recoveryCode: 'Please enter the recovery code',
      password: 'Please enter a password',
      repeatPassword: 'Please enter the password confirmation'
    },
    buttons: {
      continue: 'Continue',
      cancel: 'Cancel',
      update: 'Update Password',
      finish: 'Finish'
    }
  }
};
