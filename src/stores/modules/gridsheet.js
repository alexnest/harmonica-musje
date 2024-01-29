import { defineStore } from 'pinia'

export const useGridSheetStore = defineStore('gridsheet', {
  state: () => ({
    gridsheet: []
  }),
  actions: {
    setGridSheet(v) {
      this.gridsheet = v
    },
  },
  persist: {
    paths: ['gridsheet'],
    storage: localStorage,
  },
})