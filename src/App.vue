<script setup>
import Home from './components/Home.vue';
</script>

<template>
  <header>
    <img alt="Vue push" class="logo" src="./assets/logo.png" width="125" height="125" />
  </header>

  <main>
    <Home />
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

</style>
