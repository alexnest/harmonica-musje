<template>
  <n-layout>
    <!-- <n-layout-header bordered>
      <n-menu mode="horizontal" :dropdown-props="{ trigger: 'click' }" :options="menus" @update:value="hdlMenuClick" />
    </n-layout-header> -->
    <n-layout>
      <n-layout-content content-style="padding:10px">
        <RouterView />
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<script setup>
import { RouterView } from 'vue-router'
import { NLayout, NLayoutHeader, NLayoutContent, NMenu } from "naive-ui"
import { ref } from 'vue'

const menus = ref([
  {
    label: '数据库',
    key: 'database',
    children: [
      {
        label: '新建数据库链接',
        key: 'newDBSource'
      },
      {
        label: '刷新当前数据库',
        key: 'refreshCurDB'
      },
      {
        label: '选择数据库链接',
        key: 'chooseDBLink'
      },
    ]
  }
])

function hdlMenuClick(key, _item) {
  // 新建数据库链接
  if (key === 'newDBSource') {
    sourceModalFlag.value = true
    return false
  }
  // 刷新当前数据库
  if (key === 'refreshCurDB') {
    getTbls()
    return false
  }
}
</script>

<style scoped></style>
