<template>
  <div id="app">
    <Editor/> <!-- json="" -->
  </div>
</template>

<script>
import Editor from './components/Editor.vue'

export default {
  name: 'App',
  components: {
    Editor
  }
}
</script>

<style>
body {
    margin:0px;
    padding:0px;
}
#app {
  font-family: 'Open Sans', sans-serif;
}
</style>
