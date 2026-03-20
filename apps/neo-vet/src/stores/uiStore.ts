import { defineStore } from 'pinia';

export const useUiStore = defineStore('ui', {
    state: () => ({
        menuType: localStorage.getItem('menuType') || 'horizontal', // 'horizontal' | 'sidebar'
        leftDrawerOpen: false,
        miniState: false,
    }),
    actions: {
        toggleMenuType() {
            this.menuType = this.menuType === 'horizontal' ? 'sidebar' : 'horizontal';
            if (this.menuType === 'horizontal') {
                this.leftDrawerOpen = false;
            }
            localStorage.setItem('menuType', this.menuType);
        },
        setMenuType(type: 'horizontal' | 'sidebar') {
            this.menuType = type;
            localStorage.setItem('menuType', type);
        },
        toggleLeftDrawer() {
            this.leftDrawerOpen = !this.leftDrawerOpen;
        },
        setLeftDrawer(value: boolean) {
            this.leftDrawerOpen = value;
        },
        toggleMiniState() {
            this.miniState = !this.miniState;
        },
        setMiniState(value: boolean) {
            this.miniState = value;
        }
    },
});
