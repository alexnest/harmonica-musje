<template>
  <n-layout has-sider>
    <n-layout-content content-style="padding: 24px;">
      <n-space vertical>
        <n-card size="small">
          <n-space>
            <n-button @click="play" type="success">
              play
            </n-button>
            <n-button @click="play" type="success">
              change song
            </n-button>
            <n-button @click="goMgr" type="success">
              song manager
            </n-button>
          </n-space>
        </n-card>
        <n-card>
          <n-split direction="vertical" :default-size="0.2" :style="{height: `${viewportHeight}px`}">
            <template #1>
              <div id="song" class="song">
                <div id="preview" ref="preview" />
              </div>
            </template>
            <template #2>
              <div class="port">
                <div class="item" v-for="(item, idx) in 13">
                  <div class="item-inner">
                    {{ idx + 1 }}
                  </div>
                </div>
              </div>
              <div id="grid" class="grid">
                <div class="item" v-for="(item, idx) in gridData"
                  :style="{ left: `${gridWidth * (item.port - 1)}px`, top: `${item.top}px` }">
                  <div class="item-inner"
                    :style="{ height: `${beatHeight * item.beat}px`, background: item.o === 1 ? 'blue' : item.o === 0 ? 'red' : 'yellow' }">
                  </div>
                </div>
              </div>
            </template>
          </n-split>
        </n-card>
      </n-space>
    </n-layout-content>
  </n-layout>
</template>

<script setup>
import { parse } from 'musje'
import anime from 'animejs/lib/anime.es.js';
import { NLayout, NLayoutContent, NSpace, NSplit, NCard, NButton } from "naive-ui"

import { useGridSheetStore, useMusjeStore } from '@/stores'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const gridSheetStore = useGridSheetStore()
const myData = gridSheetStore.gridsheet
const musjeStore = useMusjeStore()
const music = musjeStore.music

const viewportHeight = ref(0)
const gridWidth = ref(50)
const gridPadding = ref(10)
const beatHeight = ref(60)
const gridData = myData.reduce((acc, cur) => {
  let top = acc.length > 0 ? acc[acc.length - 1].top + acc[acc.length - 1].beat * beatHeight.value : 0;
  acc.push({ ...cur, top: top });
  return acc;
}, [])
const totalTime = ref(51195)

// 设置生成的svg图
const preview = ref(null)
const svgWidth = ref(800)
let score = null
function setSvg() {
  try {
    score = parse(music)
    score.addStyle(`
        score {
          width: ${svgWidth.value}px
        }
      `)
    const svg = score.render()
    // 清除原有svg元素
    while (preview.value?.firstChild) {
      preview.value.removeChild(preview.value.firstChild)
    }
    // 新增新的svg元素
    preview.value.appendChild(svg)
  } catch (error) {
    console.error('error', error)
  }
}

onMounted(() => {
  viewportHeight.value = document.documentElement.clientHeight * 0.8
  setSvg()
})

function play() {
  const lastData = gridData[gridData.length - 1]
  const maxHeight = lastData.top + lastData.beat * beatHeight.value
  score.play()
  anime({
    targets: '#grid .item',
    translateY: -maxHeight,
    easing: 'linear',
    duration: totalTime.value
  })
}

function goMgr() {
  router.push({ name: 'musje' })
}
</script>

<style scoped lang="css">
.song {
  width: 100%;
  height: 100%;
}

.port {
  .item {
    display: inline-block;
    width: v-bind(gridWidth + 'px');
    text-align: center;
    padding: 5px v-bind(gridPadding + 'px');
    box-sizing: border-box;

    .item-inner {
      border: 1px solid #000;
      height: v-bind(gridWidth - 2 * gridPadding + 'px');
      line-height: v-bind(gridWidth - 2 * gridPadding + 'px');
      border-radius: 50%;
    }
  }
}

.grid {
  width: 100%;
  height: 100%;
  /* background: red; */
  position: relative;
  overflow: hidden;

  .item {
    box-sizing: border-box;
    position: absolute;
    /* background: yellow; */
    width: v-bind(gridWidth + 'px');
    padding: 0 v-bind(gridPadding + 'px') 0 v-bind(gridPadding + 'px');
    .item-inner {
      border-radius: 12px;
    }
  }
}


canvas {
  border: 1px solid #000;
}
</style>
