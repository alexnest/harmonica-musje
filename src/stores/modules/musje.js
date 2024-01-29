import { defineStore } from 'pinia'

export const useMusjeStore = defineStore('musje', {
  state: () => ({
    music: ''
  }),
  actions: {
    setMusic(v) {
      this.music = v
    },
  },
  persist: {
    paths: ['music'],
    storage: localStorage,
  },
})