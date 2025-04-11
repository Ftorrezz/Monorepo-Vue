<template>
  <q-list>

    <q-expansion-item icon="home" label="Inicio">
      <q-list class="q-pl-lg">
        <q-item
          to="/propietariomascota"
          active-class="my-menu-link"
          exact
          class="q-ma-xs navigation-item"
        >
          <q-item-section avatar>
            <q-icon name="person" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Propietario / Mascota</q-item-label>
          </q-item-section>
        </q-item>

        <q-item
          to="/agenda"
          active-class="my-menu-link"
          exact
          class="q-ma-xs navigation-item"
        >
          <q-item-section avatar>
            <q-icon name="calendar_month" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Agenda</q-item-label>
          </q-item-section>
        </q-item>

      </q-list>
    </q-expansion-item>

    <q-item
      to="/"
      active-class="my-menu-link"
      exact
      class="q-ma-xs navigation-item"
    >
      <q-item-section avatar>
        <q-icon name="dashboard" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Tablero</q-item-label>
      </q-item-section>
    </q-item>


    <q-expansion-item icon="settings" label="Configuración">
      <q-list class="q-pl-lg">

        <q-expansion-item icon="pets" label="Mascota">
          <q-list class="q-pl-lg">
            <q-item
              to="/color"
              active-class="my-menu-link"
              class="q-ma-xs navigation-item"
            >
              <q-item-section avatar side>
                <q-icon name="send" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Color</q-item-label>
              </q-item-section>
            </q-item>

            <q-item
              to="/razamascota"
              active-class="my-menu-link"
              class="q-ma-xs navigation-item"
            >
              <q-item-section avatar side>
                <q-icon name="send" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Raza</q-item-label>
              </q-item-section>
            </q-item>
            <q-item
              to="/especie"
              active-class="my-menu-link"
              class="q-ma-xs navigation-item"
            >
              <q-item-section avatar side>
                <q-icon name="send" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Especie</q-item-label>
              </q-item-section>
            </q-item>
            <q-item
              to="/sexo"
              active-class="my-menu-link"
              class="q-ma-xs navigation-item"
            >
              <q-item-section avatar side>
                <q-icon name="send" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Sexo</q-item-label>
              </q-item-section>
            </q-item>
            <q-item
              to="/habitat"
              active-class="my-menu-link"
              class="q-ma-xs navigation-item"
            >
              <q-item-section avatar side>
                <q-icon name="send" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Habitat</q-item-label>
              </q-item-section>
            </q-item>
            <q-item
              to="/caracter"
              active-class="my-menu-link"
              class="q-ma-xs navigation-item"
            >
              <q-item-section avatar side>
                <q-icon name="send" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Carácter</q-item-label>
              </q-item-section>
            </q-item>
            <q-item
              to="/dieta"
              active-class="my-menu-link"
              class="q-ma-xs navigation-item"
            >
              <q-item-section avatar side>
                <q-icon name="send" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Dieta</q-item-label>
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
