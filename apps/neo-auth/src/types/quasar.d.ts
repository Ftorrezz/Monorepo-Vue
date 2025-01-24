import 'quasar';

declare module 'quasar' {
  interface BrandOptions {
    primary?: string;
    secondary?: string;
    accent?: string;
    dark?: string;
    'dark-page'?: string;
    positive?: string;
    negative?: string;
    info?: string;
    warning?: string;
  }

  interface QVueGlobals {
    brand: {
      set: (key: keyof BrandOptions, value: string) => void;
      add: (key: keyof BrandOptions, value: string) => void;
      get: (key: keyof BrandOptions) => string;
    };
  }
}
