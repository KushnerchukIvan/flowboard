export type DialogKind = 'invite' | 'project' | 'notifications' | 'profile' | 'plan' | 'member' | 'project-menu' | 'task-menu'

export const useUiStore = defineStore('ui', {
  state: () => ({ dialog: null as DialogKind | null, target: '', toast: '' }),
  actions: {
    open(kind: DialogKind, target = '') { this.dialog = kind; this.target = target },
    close() { this.dialog = null; this.target = '' },
    notify(message: string) {
      this.toast = message
      if (import.meta.client) window.setTimeout(() => { this.toast = '' }, 2800)
    },
  },
})
