<template>
  <n-space vertical>
    <n-card size="small">
      <n-space>
        <n-button @click="play" type="success">
          play
        </n-button>
        <n-button @click="stop" type="warning">
          stop
        </n-button>
        <n-button @click="previewGridSheet" type="info">
          preview
        </n-button>
        <n-button @click="save" type="info">
          save
        </n-button>
      </n-space>
    </n-card>
    <n-grid x-gap="12" :cols="3">
      <n-gi>
        <n-card title="编辑示例" size="small">
          <n-input type="textarea" v-model:value="musje" placeholder="请输入编曲" :autosize="{
            minRows: 10
          }" />
        </n-card>
      </n-gi>
      <n-gi>
        <n-card title="简谱预览" size="small">
          <div id="preview" ref="preview" />
        </n-card>
      </n-gi>
      <n-gi>
        <n-card title="音孔吹吸对照" size="small">
          <n-input type="textarea" v-model:value="harm" placeholder="自动调整尺寸" :autosize="{
            minRows: 10
          }" />
        </n-card>
      </n-gi>
    </n-grid>
  </n-space>
</template>

<script setup>
import { NSpace, NGrid, NGi, NCard, NInput, NButton } from "naive-ui"
import { parse } from 'musje'
import { ref, onMounted, onUnmounted, watch, } from 'vue'
import { useGridSheetStore, useMusjeStore } from '@/stores'
import { useRouter } from 'vue-router'

const router = useRouter()
const gridSheetStore = useGridSheetStore()
const musjeStore = useMusjeStore()

const musje = ref(`
        title: 我們都是一家人
        subtitle: Naluwan
        composer: Taiwanese folk song

        /Allegro 4/4
        /mf 6. 6_ 6 6_6_ | 1' 6 (6_5_) 6 |
        3. 3_ 3 3_3_ | 5 3 (3_2_) 3 |
        /f 6 6_.6= 5_ 6 5_ | 5 3 (3_2_) 6, |
        2 3 5. 3_ | (2_1_) 6, 6, 0 ||
        6, 6,_6,_ 2 0 | 2 3_2_ 6, 0 |
        3_ 3 1'_ (6_5_) 3 | 1'_ 6 6_ (6_5_) (3_5_) | 3-. 0 |
        6 6 5_ 6 0_ | 2 2 3_ 3 0_ |
        6.5_ 3 2 | 3_2_ 1_7,_ 6, 0 |
        2 3 5.3_ | (2_1_) 6, 6,- |]
      `)

const preview = ref(null)
let observer = null;
let resetTimer = null;
const handleResize = (entries) => {
  if (resetTimer) {
    return false
  }
  resetTimer = setTimeout(() => {
    for (const entry of entries) {
      const { width, height } = entry.contentRect;
      // console.log(`宽度：${width}px，高度：${height}px`);
      const minWidth = Math.floor(width)
      svgWidth.value = minWidth
      setSvg()
    }
    // 清除定时器，避免内存泄露
    resetTimer = null;
  }, 1000);
};

onMounted(() => {
  setSvg()
  observer = new ResizeObserver(handleResize);
  observer.observe(preview.value);
})

onUnmounted(() => {
  // 在组件销毁前取消观察
  if (observer) {
    observer.disconnect()
  }
  resetTimer = null
});

// 设置生成的svg图
const svgWidth = ref(800)
let score = null
function setSvg() {
  try {
    score = parse(musje.value)
    parseMusje()
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

function play() {
  score.play()
}

function stop() {
  score.stop()
}

function previewGridSheet() {
  let gridsheet = JSON.parse(harm.value)
  gridSheetStore.setGridSheet(gridsheet)
  musjeStore.setMusic(musje.value)
  router.push({ name: 'gridSheet' })
}

const harm = ref('')
function parseMusje() {
  let sArr = []
  const excludes = ['', '/pp', '/p', '/mp', '/mf', '/f', '/ff', '/crescendo', '/decrescendo', '/diminuendo', '[', ']']
  const data = musje.value
  const arr = data.split('\n\n')
  if (arr.length > 1) {
    // barArr 小节线数组
    let barArr = arr[1].split('\n')
    if (barArr.length > 1) {
      barArr = barArr.slice(1, barArr.length - 1).map(item => {
        return item.trim()
      }).join('').split('|')
    }
    for (let i = 0; i < barArr.length; i++) {
      const item = barArr[i]
      if (item) {
        let arr = item.split(' ').filter(item => !excludes.includes(item))
        if (arr.length) {
          for (let j = 0; j < arr.length; j++) {
            let line = {}
            let tempLine = arr[j].replace(/\(/g, '').replace(/\)/g, '')
            line = { line: tempLine }
            if (j === arr.length - 1) {
              line.barLine = 1
            }
            sArr.push(line)
          }
        }
      }
    }
    let pb = []
    sArr.forEach(item => {
      let temp = parseChar(item)
      pb = pb.concat(temp)
    })
    const tempHarm = intoBan12(pb)
    harm.value = JSON.stringify(tempHarm, null, 2)
  }
}

const ban12Map = {
  '': { port: 13, o: -1 },
  '1,': { port: 1, o: 1 },
  '2,': { port: 1, o: 0 },
  '3,': { port: 2, o: 1 },
  '4,': { port: 2, o: 0 },
  '5,': { port: 3, o: 1 },
  '6,': { port: 3, o: 0 },
  '7,': { port: 4, o: 0 },
  '1': { port: 5, o: 1 },
  '2': { port: 5, o: 0 },
  '3': { port: 6, o: 1 },
  '4': { port: 6, o: 0 },
  '5': { port: 7, o: 1 },
  '6': { port: 7, o: 0 },
  '7': { port: 8, o: 1 },
  '1\'': { port: 9, o: 1 },
  '2\'': { port: 9, o: 0 },
  '3\'': { port: 10, o: 1 },
  '4\'': { port: 10, o: 0 },
  '5\'': { port: 11, o: 1 },
  '6\'': { port: 11, o: 0 },
  '7\'': { port: 12, o: 0 },
}

function intoBan12(items) {
  return items.map(item => {
    if (item.barLine) {
      return {
        ...item,
        port: ban12Map[item.pitch].port,
        o: ban12Map[item.pitch].o,
        z: item.barLine
      }
    } else {
      return {
        ...item,
        port: ban12Map[item.pitch].port,
        o: ban12Map[item.pitch].o
      }
    }
  })
}

// let char = '6_.6='
const PITCH = ['1', '2', '3', '4', '5', '6', '7'] // 中音区7个音阶
const HL = ['\'', ','] // 高低音符号
function parseChar(cbItem) {
  const char = cbItem.line
  let arr = []
  let chars = char.split('')
  let pitch = ''
  let beat = 1
  for (let i = 0; i < chars.length; i++) {
    const item = chars[i]
    if (PITCH.includes(item)) {
      if (pitch) {
        arr.push({ pitch, beat })
      }
      pitch = item
      beat = 1
    } else if (HL.includes(item)) {
      pitch += item
    } else if (item === '_') {
      beat = beat * 0.5
    } else if (item === '=') {
      beat = beat * 0.25
    } else if (item === '-') {
      beat = beat * 2
    } else if (item === '.') {
      beat = beat + beat * 0.5
    }
    if (i === chars.length - 1) {
      if (cbItem.barLine) {
        arr.push({ pitch, beat, barLine: 1 })
      } else {
        arr.push({ pitch, beat })
      }
    }
  }
  return arr
}

function save() {
  let gridsheet = JSON.parse(harm.value)
  gridSheetStore.setGridSheet(gridsheet)
  musjeStore.setMusic(musje.value)
  router.push({ name: 'gridSheet' })
}

// parseChar()


// 解析8分音符

// 解析16分音符

// 解析延时符

// 解析连音符

watch(musje, () => {
  if (resetTimer) {
    clearTimeout(resetTimer);
  }
  setSvg()
  parseMusje()
  resetTimer = null
})

</script>

<style  scoped></style>

