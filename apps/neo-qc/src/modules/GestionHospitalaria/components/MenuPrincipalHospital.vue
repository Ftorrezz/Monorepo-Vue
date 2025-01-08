<template>
  <q-list>
    <q-item
      to="/"
      active-class="my-menu-link"
      exact
      class="q-ma-xs navigation-item"
    >
      <q-item-section avatar>
        <q-icon name="home" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Inicio</q-item-label>
      </q-item-section>
    </q-item>

    <q-item
      to="/gestionhospital/dashboardhospital"
      active-class="my-menu-link"
      exact
      class="q-ma-xs navigation-item"
    >
      <q-item-section avatar>
        <q-icon name="dashboard" color="blue" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Tablero</q-item-label>
      </q-item-section>
    </q-item>

    <!--<q-item
      to="/busquedaclientemascota"
      active-class="my-menu-link"
      exact
      class="q-ma-xs navigation-item"
    >
      <q-item-section avatar>
        <q-icon name="pets" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Propietario / Paciente</q-item-label>
      </q-item-section>
    </q-item>-->

    <q-expansion-item icon="person" label="Paciente">
      <q-list class="q-pl-lg">
        <q-item
          to="/gestionhospital/busquedapaciente"
          active-class="my-menu-link"
          exact
          class="q-ma-xs navigation-item"
        >
          <q-item-section avatar>
            <q-icon name="person" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Paciente</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-expansion-item>

    <q-expansion-item icon="settings" label="Configuración">
      <q-list class="q-pl-lg">
        <q-expansion-item icon="list" label="General">
          <q-list class="q-pl-lg">
            <q-item
              to="/gestionhospital/delegacion"
              active-class="my-menu-link"
              class="q-ma-xs navigation-item"
            >
              <q-item-section avatar side>
                <q-icon name="adjust" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Delegación</q-item-label>
              </q-item-section>
            </q-item>

            <q-item
              to="/gestionhospital/estado"
              active-class="my-menu-link"
              class="q-ma-xs navigation-item"
            >
              <q-item-section avatar side>
                <q-icon name="adjust" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Estado</q-item-label>
              </q-item-section>
            </q-item>

            <q-item
              to="/gestionhospital/pais"
              active-class="my-menu-link"
              class="q-ma-xs navigation-item"
            >
              <q-item-section avatar side>
                <q-icon name="adjust" />
              </q-item-section>
              <q-item-section>
                <q-item-label>País</q-item-label>
              </q-item-section>
            </q-item>

            <q-item
              to="/gestionhospital/origenpaciente"
              active-class="my-menu-link"
              class="q-ma-xs navigation-item"
            >
              <q-item-section avatar side>
                <q-icon name="adjust" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Origen Paciente</q-item-label>
              </q-item-section>
            </q-item>

            <q-expansion-item icon="home_work" label="Institucional">
              <q-list class="q-pl-lg">
                <q-item
                  to="/gestionhospital/entidad"
                  active-class="my-menu-link"
                  class="q-ma-xs navigation-item"
                >
                  <q-item-section avatar side>
                    <q-icon name="adjust" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Entidad</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item
                  to="/gestionhospital/sucursal"
                  active-class="my-menu-link"
                  class="q-ma-xs navigation-item"
                >
                  <q-item-section avatar side>
                    <q-icon name="adjust" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Sucursal</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-expansion-item>
          </q-list>
        </q-expansion-item>

        <!--<q-expansion-item icon="pets" label="Mascota">
          <q-list class="q-pl-lg">
            <q-item
              to="/especie"
              active-class="my-menu-link"
              class="q-ma-xs navigation-item"
            >
              <q-item-section avatar>
                <q-icon name="adjust" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Especie</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-expansion-item>-->

        <q-expansion-item icon="person" label="Persona">
          <q-list class="q-pl-lg">
            <q-item
              to="/gestionhospital/escolaridad"
              active-class="my-menu-link"
              class="q-ma-xs navigation-item"
            >
              <q-item-section avatar side>
                <q-icon name="adjust" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Escolaridad</q-item-label>
              </q-item-section>
            </q-item>

            <q-item
              to="/gestionhospital/estadocivil"
              active-class="my-menu-link"
              class="q-ma-xs navigation-item"
            >
              <q-item-section avatar side>
                <q-icon name="adjust" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Estado Civil</q-item-label>
              </q-item-section>
            </q-item>

            <q-item
              to="/gestionhospital/genero"
              active-class="my-menu-link"
              class="q-ma-xs navigation-item"
            >
              <q-item-section avatar side>
                <q-icon name="adjust" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Género</q-item-label>
              </q-item-section>
            </q-item>

            <q-item
              to="/gestionhospital/ocupacion"
              active-class="my-menu-link"
              class="q-ma-xs navigation-item"
            >
              <q-item-section avatar side>
                <q-icon name="adjust" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Ocupación</q-item-label>
              </q-item-section>
            </q-item>

            <q-item
              to="/gestionhospital/religion"
              active-class="my-menu-link"
              class="q-ma-xs navigation-item"
            >
              <q-item-section avatar side>
                <q-icon name="adjust" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Religión</q-item-label>
              </q-item-section>
            </q-item>

            <q-item
              to="/gestionhospital/tipoidentificacion"
              active-class="my-menu-link"
              class="q-ma-xs navigation-item"
            >
              <q-item-section avatar side>
                <q-icon name="adjust" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Tipo Identificación</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-expansion-item>

        <q-expansion-item icon="lock" label="Seguridad">
          <q-list class="q-pl-lg">
            <q-item
              to="/gestionhospital/usuarioacceso"
              active-class="my-menu-link"
              class="q-ma-xs navigation-item"
            >
              <q-item-section avatar>
                <q-icon name="lock_reset" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Accesos</q-item-label>
              </q-item-section>
            </q-item>

            <q-item
              to="/gestionhospital/usuario"
              active-class="my-menu-link"
              class="q-ma-xs navigation-item"
            >
              <q-item-section avatar>
                <q-icon name="group" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Usuarios</q-item-label>
              </q-item-section>
            </q-item>

            <q-item
              to="/gestionhospital/usuarioperfil"
              active-class="my-menu-link"
              class="q-ma-xs navigation-item"
            >
              <q-item-section avatar>
                <q-icon name="settings_accessibility" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Perfiles</q-item-label>
              </q-item-section>
            </q-item>

            <!--<q-item
              to="/gestionhospital/usuariorol"
              active-class="my-menu-link"
              class="q-ma-xs navigation-item"
            >
              <q-item-section avatar>
                <q-icon name="rule" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Roles</q-item-label>
              </q-item-section>
            </q-item>-->
          </q-list>
        </q-expansion-item>
      </q-list>
    </q-expansion-item>

       

    
  </q-list>
</template>

<style lang="scss">
.my-menu-link {
  color: white;
  background: $primary;
  border-radius: 5px;
}
.navigation-item {
  border-radius: 8px;
}
</style>
