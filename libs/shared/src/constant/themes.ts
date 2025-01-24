// themes.ts
export const themes = {
    default: {
      primary: '#1976d2',
      secondary: '#26A69A',
      accent: '#9C27B0',
      dark: '#1d1d1d',
      'dark-page': '#121212',
      positive: '#21BA45',
      negative: '#C10015',
      info: '#31CCEC',
      warning: '#F2C037'
    },
    light: {
      primary: '#4CAF50',
      secondary: '#FFC107',
      accent: '#9C27B0',
      dark: '#eeeeee',
      'dark-page': '#ffffff',
      positive: '#4CAF50',
      negative: '#F44336',
      info: '#2196F3',
      warning: '#FF9800'
    },
    dark: {
      primary: '#1E88E5',
      secondary: '#43A047',
      accent: '#E91E63',
      dark: '#000000',
      'dark-page': '#121212',
      positive: '#00E676',
      negative: '#FF1744',
      info: '#00B0FF',
      warning: '#FF9100'
    }
  } as const;
  
  export type ThemeName = keyof typeof themes;