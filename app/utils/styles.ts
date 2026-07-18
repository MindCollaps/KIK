import type { PartialRecord } from '../../types';

export const colorsList = {
    //#region neutrals
    white: '#FBF8F4',
    black: '#1B1613',
    blackAlpha2: '#1B161305',
    blackAlpha4: '#1B16130a',
    blackAlpha8: '#1B161314',
    blackAlpha12: '#1B16131f',
    blackAlpha24: '#1B16133d',
    blackAlpha36: '#1B16135c',
    blackAlpha64: '#1B1613a3',
    whiteAlpha2: '#FBF8F405',
    whiteAlpha4: '#FBF8F40a',
    whiteAlpha8: '#FBF8F414',
    whiteAlpha12: '#FBF8F41f',
    whiteAlpha24: '#FBF8F43d',
    whiteAlpha36: '#FBF8F45c',
    whiteAlpha64: '#FBF8F4a3',

    // "lightgray" = foreground/text tones used on dark surfaces
    lightgray0: '#FAF7F3',
    lightgray50: '#F4F0EA',
    lightgray100: '#EAE4DB',
    lightgray125: '#E0D9CD',
    lightgray150: '#D3CABB',
    lightgray200: '#C2B7A5',
    lightgray300: '#A89C88',
    lightgray400: '#8C7F6C',

    // "darkgray" = surface/background tones
    darkgray1000: '#0F0C0A',
    darkgray950: '#161210',
    darkgray900: '#1D1815',
    darkgray875: '#241E1A',
    darkgray850: '#2B2420',
    darkgray800: '#332B25',
    darkgray700: '#453A31',
    darkgray600: '#5C4F42',

    // primary: marquee red — Kino im Kasten brand color
    primary700: '#7A1B15',
    primary600: '#9C2419',
    primary500: '#C4301F',
    primary400: '#DD5B45',
    primary300: '#EE9683',

    // secondary: projector-bulb gold, the film-strip accent
    secondary700: '#7A5A12',
    secondary600: '#99721A',
    secondary500: '#C08F2E',
    secondary400: '#D7AC5C',
    secondary300: '#E8CB92',

    success700: '#2D6A32',
    success600: '#3A8542',
    success500: '#4C9E55',
    success400: '#74B87C',
    success300: '#A0D2A5',

    warning700: '#A6600B',
    warning600: '#C97911',
    warning500: '#E2941F',
    warning400: '#EDB25A',
    warning300: '#F5D08F',

    error700: '#7A1345',
    error600: '#9C1B58',
    error500: '#C22569',
    error400: '#DA5A8E',
    error300: '#EA92B6',

    info700: '#136F66',
    info600: '#188C81',
    info500: '#1FAA9C',
    info400: '#54C0B5',
    info300: '#8AD6CE',
};

export type ColorsList = keyof typeof colorsList;

export const themesList = {
    // light: the KiK default — warm paper surfaces, ink-brown foreground text.
    // Surfaces sit around 90% lightness instead of near-white to avoid glare.
    light: {
        darkgray1000: '#F0E9DD',
        darkgray950: '#E9E0D0',
        darkgray900: '#E0D5C2',
        darkgray875: '#D8CBB5',
        darkgray850: '#CFC0A7',
        darkgray800: '#C2B094',
        darkgray700: '#A89477',
        darkgray600: '#8C795D',

        lightgray0: '#1B1613',
        lightgray50: '#241D18',
        lightgray100: '#332922',
        lightgray125: '#3E332A',
        lightgray150: '#4A3D32',
        lightgray200: '#5C4C3D',
        lightgray300: '#675541',
        lightgray400: '#75644F',
    },
    // dark: mirrors the base palette (near-black surfaces, warm light text)
    dark: {
        lightgray0: '#FAF7F3',
        lightgray50: '#F4F0EA',
        lightgray100: '#EAE4DB',
        lightgray125: '#E0D9CD',
        lightgray150: '#D3CABB',
        lightgray200: '#C2B7A5',
        lightgray300: '#A89C88',
        lightgray400: '#8C7F6C',

        darkgray1000: '#0F0C0A',
        darkgray950: '#161210',
        darkgray900: '#1D1815',
        darkgray875: '#241E1A',
        darkgray850: '#2B2420',
        darkgray800: '#332B25',
        darkgray700: '#453A31',
        darkgray600: '#5C4F42',
    },
} satisfies Record<string, PartialRecord<ColorsList, string>>;

export type ThemesList = keyof typeof themesList | 'default';
