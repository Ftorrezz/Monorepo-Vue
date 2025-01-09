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

    <q-expansion-item icon="settings" label="Configuración">
      <q-list class="q-pl-lg">
        <q-expansion-item icon="home_work" label="Institucional">
          <q-list class="q-pl-lg">
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
          </q-list>
        </q-expansion-item>

        <q-expansion-item icon="lock" label="Seguridad">
          <q-list class="q-pl-lg">
            <q-item
              to="/gestionhospital/accesos"
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

            <q-item
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
            </q-item>
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
