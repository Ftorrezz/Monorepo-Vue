<template>
  <div class="login-page">
    <q-layout>
      <q-page-container>
        <q-page class="flex flex-center">
          <!-- Selector de idioma flotante -->
          <div class="language-selector">
            <q-btn-dropdown
              class="language-btn"
              flat
              no-caps
              :ripple="false"
            >
              <template v-slot:label>
                <div class="language-label">
                  <span class="flag-emoji">{{ getCurrentLanguageFlag() }}</span>
                  <span class="language-text">{{ getCurrentLanguageLabel() }}</span>
                </div>
              </template>
              
              <q-list>
                <q-item
                  v-for="option in localeOptions"
                  :key="option.value"
                  clickable
                  @click="changeLanguage(option.value)"
                  :class="{ 'selected-language': locale === option.value }"
                >
                  <q-item-section avatar>
                    <span class="flag-emoji">{{ option.flag }}</span>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ option.label }}</q-item-label>
                  </q-item-section>
                  <q-item-section side v-if="locale === option.value">
                    <q-icon name="check" color="primary" />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </div>
          
          <!-- Contenedor principal horizontal -->
          <div class="login-container">
            <!-- Panel Izquierdo - Logo y Branding -->
            <div class="brand-panel">
              <div class="brand-content">
                <!-- Logo NeoVET Oficial - Parte Superior -->
                <div class="logo-section-top">
                  <div class="logo-container-large">
                    <img 
                      src="../../../public/static/NeoVET.png" 
                      alt="NeoVET - Sistema de Gestión Veterinaria" 
                      class="logo-image"
                      @error="handleLogoError"
                    />
                  </div>
                </div>

                <!-- Descripción - Parte Inferior -->
                <div class="welcome-section-bottom">
                  <h2 class="welcome-title">{{ $t("login") }}</h2>
                  <p class="welcome-description">{{ $t("descripcionsistema") }}</p>
                </div>
              </div>

              <!-- Elementos decorativos -->
              <div class="floating-elements">
                <div class="floating-icon" style="--delay: 0s; --x: 10%; --y: 15%;">
                  <q-icon name="pets" size="20px" />
                </div>
                <div class="floating-icon" style="--delay: 1s; --x: 85%; --y: 25%;">
                  <q-icon name="favorite" size="16px" />
                </div>
                <div class="floating-icon" style="--delay: 2s; --x: 20%; --y: 85%;">
                  <q-icon name="healing" size="18px" />
                </div>
              </div>
            </div>

            <!-- Panel Derecho - Formulario -->
            <div class="form-panel">
              <div class="form-wrapper">
                <div class="form-header">
                  <h3>{{ $t("login") }}</h3>
                  <!--<div class="text-subtitle2">
                    {{ $t("descripcionsistema") }}
                  </div>-->
                </div>

                <q-form class="login-form" @submit.prevent="onSubmit">
                  <q-input
                    outlined
                    v-model="userForm.nombreusuario"
                    :label="$t('inputlogin.label')"
                    lazy-rules
                    :rules="[validationRule]"
                    class="modern-input"
                    
                  >
                    <template v-slot:prepend>
                      <q-icon name="person_outline" color="primary" />
                    </template>
                  </q-input>

                  <q-input
                    outlined
                    v-model="userForm.clave"
                    :label="$t('inputlogin.labelpassword')"
                    :type="isPwd ? 'password' : 'text'"
                    lazy-rules
                    :rules="[passwordValidationRule]"
                    class="modern-input"
                    placeholder="••••••••"
                  >
                    <template v-slot:prepend>
                      <q-icon name="lock_outline" color="primary" />
                    </template>
                    <template v-slot:append>
                      <q-icon
                        :name="isPwd ? 'visibility_off' : 'visibility'"
                        class="cursor-pointer"
                        @click="isPwd = !isPwd"
                        color="grey-6"
                      />
                    </template>
                  </q-input>
                  <div class="row items-center justify-between">
                    <div>

                    <!--<q-select
                    v-model="locale"
                    :options="localeOptions"
                    dense
                    borderless
                    emit-value
                    map-options
                    options-dense
                    style="min-width: 150px"
                  >
                    <template v-slot:prepend>
                      <q-icon name="translate" />
                    </template>
                  </q-select>-->
                  </div>

                    <q-btn
                      flat
                      dense
                      color="primary"
                      :label="t('forgotPassword')"
                      @click="olvidoClave = !olvidoClave"
                      class="forgot-btn"
                      no-caps
                    />
                  </div>

                  <div>
                  
                  

                  <q-btn type="submit" color="primary" class="full-width">
                    {{ $t("login") }}
                  </q-btn>
                </div>
                <!--<q-btn
                    type="submit"
                    :label="t('login')"
                    color="primary"
                    size="lg"
                    :loading="loading"
                    class="login-btn"
                    unelevated
                    no-caps
                  >
                    <template v-slot:loading>
                      <q-spinner-oval />
                      {{ $t("login") }}
                    </template>
                  </q-btn>-->
                <!--<q-btn
                    type="submit"
                    :label={{ $t("login") }}
                    color="primary"
                    size="lg"
                    :loading="loading"
                    class="login-btn"
                    unelevated
                    no-caps
                  >
                    <template v-slot:loading>
                      <q-spinner-oval />
                      {{ texts.signingIn }}
                    </template>
                  </q-btn>-->

                  <!-- Componente de cambio de clave -->
                  <div v-if="olvidoClave && userForm.nombreusuario">
                    <CambioClaveUsuario
                      :nombreUsuario="userForm.nombreusuario"
                      @cancelar="cancelarOlvidoClave"
                    />
                  </div>
                </q-form>

                <!-- Links de ayuda -->
                <!--<div class="help-links">
                  <a href="#" class="help-link">
                    <q-icon name="help_outline" size="16px" />
                    {{ texts.help }}
                  </a>
                  <span class="divider">•</span>
                  <a href="#" class="help-link">
                    <q-icon name="phone" size="16px" />
                    {{ texts.support }}
                  </a>
                </div>-->

                <div class="form-footer">
                  <p> 'NeoVET v2.0 © 2025' </p>
                </div>
              </div>

              <!-- Diálogo de ubicación -->
              <DialogoUbicacion />
            </div>
          </div>

          <!-- Partículas de fondo -->
          <div class="background-particles">
            <div class="particle" v-for="n in 15" :key="n" :style="getParticleStyle()"></div>
          </div>
        </q-page>
      </q-page-container>
    </q-layout>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, toRaw } from "vue";
import { useRouter } from "vue-router";
import useAuth from "../../composables/useAuth";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import CambioClaveUsuario from "../../components/CambioClaveUsuario.vue";
import DialogoUbicacion from "../../components/dialog/DialogoUbicacion.vue";
import { useDialogStore } from "../../stores/DialogoUbicacion";

defineOptions({
  name: "login",
});

const $q = useQuasar();
const router = useRouter();
const { loginUser, logout, sucursales } = useAuth();
const { t, locale } = useI18n({ useScope: "global" });
const dialogStore = useDialogStore();

// Estados del formulario
const userForm = ref({
  nombreusuario: null,
  clave: null,
});

const isPwd = ref(true);
const loading = ref(false);
const rememberMe = ref(false);
const olvidoClave = ref(false);

const localeOptions = [
  { value: "es", label: "Español", flag: "🇪🇸" },
  { value: "en-US", label: "English", flag: "🇺🇸" },
];

// Método para obtener el label del idioma actual
const getCurrentLanguageLabel = () => {
  const currentOption = localeOptions.find(option => option.value === locale.value);
  return currentOption ? currentOption.label : 'Español';
};

// Método para obtener la bandera del idioma actual
const getCurrentLanguageFlag = () => {
  const currentOption = localeOptions.find(option => option.value === locale.value);
  return currentOption ? currentOption.flag : '🇪🇸';
};

// Método para cambiar idioma
const changeLanguage = (languageValue) => {
  locale.value = languageValue;
  $q.notify({
    type: 'positive',
    message: `Idioma cambiado a ${getCurrentLanguageLabel()}`,
    position: 'top',
    timeout: 2000
  });
};

// Validaciones (manteniendo las originales)
const validationRule = (val: string) => {
  return (val && val.length > 0) || t("inputlogin.validation");
};

const passwordValidationRule = (val: string) => {
  return (val && val.length > 0) || t("inputlogin.validationpassword");
};

// Watchers (manteniendo la lógica original)
watch(
  () => dialogStore.sucursalSeleccionada,
  (newVal) => {
    if (newVal) {
      router.push({ name: "inicio" });
    }
  }
);

watch(olvidoClave, (newValue) => {
  if (newValue === true) {
    if (!userForm.value.nombreusuario) olvidoClave.value = false;
  }
});

// Métodos
const onSubmit = async (): void => {
  loading.value = true;
  
  try {
    const { ok, error } = await loginUser(userForm.value);

    if (ok == true) {
      if (sucursales.value && sucursales.value.length > 1) {
        await dialogStore.openDialog(toRaw(sucursales.value));
      } else {
        if (sucursales.value && sucursales.value.length === 1) {
          const unicaSucursal = toRaw(sucursales.value[0]);
          dialogStore.selectBranch(unicaSucursal);
        }
      }
    }
  } finally {
    loading.value = false;
  }
};

const cancelarOlvidoClave = () => {
  olvidoClave.value = false;
};

const handleLogoError = (event) => {
  console.error('Error cargando el logo:', event);
  // Fallback: mostrar texto si no se puede cargar la imagen
  event.target.style.display = 'none';
};

const getParticleStyle = () => {
  return {
    left: Math.random() * 100 + '%',
    animationDelay: Math.random() * 2 + 's',
    animationDuration: (Math.random() * 3 + 2) + 's'
  };
};
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

/* Selector de idioma flotante */
.language-selector {
  position: absolute;
  top: 30px;
  right: 30px;
  z-index: 100;
}

.language-btn {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50px;
  padding: 8px 16px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  min-width: 120px;
}

.language-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
}

.language-btn :deep(.q-btn__content) {
  color: white;
}

.language-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.flag-emoji {
  font-size: 18px;
  line-height: 1;
}

.language-text {
  font-size: 14px;
  font-weight: 500;
  color: white;
}

.selected-language {
  background-color: rgba(79, 172, 254, 0.1);
}

/* Contenedor principal horizontal */
.login-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: white;
  border-radius: 50px;
  box-shadow: 0 25px 80px rgba(0,0,0,0.15);
  overflow: hidden;
  width: 100%;
  max-width: 1000px;
  min-height: 400px;
}

/* Panel izquierdo - Branding con fondo blanco */
.brand-panel {
  background: white;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #4facfe;
  box-shadow: inset -5px 0 15px rgba(79, 172, 254, 0.1);
}

.brand-content {
  padding: 50px 40px;
  text-align: center;
  color: #1a365d;
  position: relative;
  z-index: 2;
}

/* Logo section */
.logo-section {
  margin-bottom: 30px;
}

.logo-container {
  width: 120px;
  height: 120px;
  margin: 0 auto 20px;
  filter: drop-shadow(0 8px 25px rgba(0,0,0,0.15));
  transition: transform 0.3s ease;
}

.logo-container:hover {
  transform: scale(1.05);
}

.logo-svg {
  width: 100%;
  height: 100%;
  animation: logoFloat 6s ease-in-out infinite;
}

.logo-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  animation: logoFloat 6s ease-in-out infinite;
}

@keyframes logoFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}

.brand-info {
  margin-bottom: 30px;
}

.brand-title {
  font-size: 42px;
  font-weight: 900;
  margin: 0 0 12px 0;
  letter-spacing: -2px;
  background: linear-gradient(135deg, #1a365d, #2c5282);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: none;
  font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
}

.brand-subtitle {
  font-size: 16px;
  color: #2c5282;
  margin: 0 0 40px 0;
  font-weight: 500;
  font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Welcome section */
.welcome-section {
  max-width: 320px;
  margin: 0 auto;
}

.logo-image {
  width: 100%;
  height: auto;
  object-fit: contain;
  animation: logoFloat 6s ease-in-out infinite;
  display: block;
}

.welcome-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 16px;
  line-height: 1.3;
  color: #2d3748;
  font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
}

.welcome-description {
  font-size: 16px;
  color: #4a5568;
  line-height: 1.6;
  margin: 0;
  font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 400;
}

/* Elementos flotantes */
.floating-elements {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.floating-icon {
  position: absolute;
  color: #4facfe;
  animation: float 4s ease-in-out infinite;
  animation-delay: var(--delay);
  left: var(--x);
  top: var(--y);
}

@keyframes float {
  0%, 100% { transform: translateY(0px); opacity: 0.4; }
  50% { transform: translateY(-15px); opacity: 0.7; }
}

/* Panel derecho - Formulario */
.form-panel {
  padding: 50px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #fafbfc;
  position: relative;
}

.form-wrapper {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.form-header {
  text-align: center;
  margin-bottom: 35px;
}

.form-header h3 {
  font-size: 28px;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 8px 0;
}

.form-header p {
  color: #718096;
  margin: 0;
  font-size: 15px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
}

.modern-input :deep(.q-field__control) {
  height: 56px;
  border-radius: 12px;
  font-size: 16px;
  background: white;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

.modern-input :deep(.q-field__control:hover) {
  border-color: #cbd5e0;
}

.modern-input :deep(.q-field--focused .q-field__control) {
  border-color: #4facfe;
  box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.1);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0;
}

.forgot-btn {
  font-size: 14px;
  text-decoration: underline;
  padding: 4px 8px;
}

.login-btn {
  height: 56px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  transition: all 0.3s ease;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(79, 172, 254, 0.3);
}

/* Footer y ayuda */
.help-links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.help-link {
  display: flex;
  align-items: center;
  color: #4facfe;
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.help-link:hover {
  color: #667eea;
}

.help-link .q-icon {
  margin-right: 4px;
}

.divider {
  color: #cbd5e0;
  font-size: 12px;
}

.form-footer {
  text-align: center;
}

.form-footer p {
  font-size: 12px;
  color: #a0aec0;
  margin: 0;
}

/* Partículas de fondo */
.background-particles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
}

.particle {
  position: absolute;
  width: 3px;
  height: 3px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  animation: particleFloat linear infinite;
}

@keyframes particleFloat {
  0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) rotate(360deg);
    opacity: 0;
  }
}

/* Responsive */
@media (max-width: 1024px) {
  .login-container {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    max-width: 500px;
  }
  
  .brand-panel {
    display: block;
    padding: 30px;
    border-right: none;
    border-bottom: 3px solid #4facfe;
    box-shadow: inset 0 -5px 15px rgba(79, 172, 254, 0.1);
  }
  
  .brand-content {
    padding: 25px 20px;
    height: auto;
  }
  
  .logo-container-large {
    width: 90%;
    max-width: 250px;
    padding: 20px;
    margin-bottom: 25px;
  }
  
  .welcome-section-bottom {
    display: none;
  }
  
  .form-panel {
    background: white;
  }
}

@media (max-width: 768px) {
  .login-page {
    padding: 15px;
  }
  
  .login-container {
    border-radius: 20px;
  }
  
  .brand-panel {
    padding: 20px;
  }
  
  .form-panel {
    padding: 30px 25px;
  }
  
  .language-selector {
    top: 20px;
    right: 20px;
  }
  
  .help-links {
    flex-direction: column;
    gap: 10px;
  }
  
  .divider {
    display: none;
  }
  
  .brand-title {
    font-size: 28px;
  }
}

@media (max-width: 480px) {
  .brand-panel {
    padding: 15px;
  }
  
  .form-panel {
    padding: 25px 20px;
  }
  
  .form-header h3 {
    font-size: 24px;
  }
  
  .brand-title {
    font-size: 26px;
  }
  
  .logo-container-large {
    width: 85%;
    max-width: 200px;
    padding: 15px;
  }
  
  .language-select {
    min-width: 120px;
  }
  
  .language-text {
    font-size: 12px;
  }
  
  .language-selector {
    top: 15px;
    right: 15px;
  }
}
</style>