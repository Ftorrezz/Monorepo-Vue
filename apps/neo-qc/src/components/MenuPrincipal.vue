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
