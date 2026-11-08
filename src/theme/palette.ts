/** Única fuente de colores de la aplicación; ninguna vista fija su propia paleta. */
export const appPalette = {
 light: {sidebar:'#eef0f3',main:'#f8f9fb',background:'#f1f3ef',surface:'#ffffff',text:'#28332f',muted:'#5b6862',border:'#d5ddd6',primary:'#315caa',primaryLight:'#7799d3',primaryDark:'#234580',onPrimary:'#ffffff',selected:'#e4ebf6',hover:'#edf1f7',error:'#b42318',shadow:'#2436290d',backdrop:'#24302c55'},
 dark: {sidebar:'#191d20',main:'#202529',background:'#1d1f23',surface:'#27292e',text:'#e4e7ed',muted:'#a3adbd',border:'#3c414b',primary:'#82aaff',primaryLight:'#acc5ff',primaryDark:'#5885e7',onPrimary:'#14213d',selected:'#253754',hover:'#303845',error:'#ff9a91',shadow:'#00000033',backdrop:'#00000088'},
} as const;

/** Intensidades visuales reutilizables: nunca se difumina el texto o los controles. */
export const surfaceEffects = {
  light: {tint: 0.04, halo: 0.05, border: 0.30, overlayBlur: 3},
  dark: {tint: 0.15, halo: 0.16, border: 0.32, overlayBlur: 3},
} as const;
