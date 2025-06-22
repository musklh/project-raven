<script setup lang="ts">
// 路由容器组件
</script>

<template>
  <router-view />
</template>

<style>
/* 全局样式重置，确保路由页面能完全控制样式 */
body {
  margin: 0;
  padding: 0;
}

#app {
  height: 100vh;
  margin: 0;
  padding: 0;
  text-align: initial;
  max-width: none;
}
</style>
