<template>
  <!--<q-card class="my-card" :class="`shadow-${2}`" bordered>-->
  <q-card class="my-card shadow-bg" :class="`shadow-${3}`">
    <q-card-section>
      <div class="text-h5">
        <q-icon name="adjust" />
        {{ tituloVentana }}
      </div>
    </q-card-section>
  </q-card>
</template>

<script>
export default {
  props: ["tituloVentana"],

  setup() {},
};
</script>

<style lang="scss" scoped>
.shadow-bg {
  background-color: rgba(255, 255, 255, 0.1); /* Color de fondo con transparencia */
  box-shadow: 0px 0px 20px rgba(46, 59, 242, 0.7); /* Sombra negra con opacidad */
  //box-shadow: 0px 0px 20px rgba(47, 6, 230, 0.6); /* Sombra negra con opacidad */
}
</style>


