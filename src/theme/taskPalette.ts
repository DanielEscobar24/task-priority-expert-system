/** 20 colores fijos: identidad visual, nunca prioridad ni resultado del motor. */
export const taskPalette = [
  {name: 'azul', light: {accent: '#2457ba', surface: '#dbe8ff'}, dark: {accent: '#8bb4ff', surface: '#24334d'}},
  {name: 'verde', light: {accent: '#287044', surface: '#daf0e1'}, dark: {accent: '#8ed5a5', surface: '#243b2d'}},
  {name: 'violeta', light: {accent: '#7543aa', surface: '#e9defa'}, dark: {accent: '#c4a3f2', surface: '#362b48'}},
  {name: 'ámbar', light: {accent: '#8b5a10', surface: '#ffebc2'}, dark: {accent: '#edc676', surface: '#403624'}},
  {name: 'rosa', light: {accent: '#a33d69', surface: '#faddea'}, dark: {accent: '#efa4c2', surface: '#452b38'}},
  {name: 'turquesa', light: {accent: '#186e70', surface: '#d2efed'}, dark: {accent: '#84d2cf', surface: '#233c3d'}},
  {name: 'índigo', light: {accent: '#5148a3', surface: '#e1e0fc'}, dark: {accent: '#b0a8f4', surface: '#302e49'}},
  {name: 'coral', light: {accent: '#a34532', surface: '#ffe0d2'}, dark: {accent: '#f0ad94', surface: '#432e28'}},
  {name: 'oliva', light: {accent: '#617124', surface: '#e8efca'}, dark: {accent: '#c0cf87', surface: '#353b25'}},
  {name: 'cielo', light: {accent: '#246b96', surface: '#d7edf9'}, dark: {accent: '#8acbea', surface: '#253947'}},
  {name: 'ciruela', light: {accent: '#873c87', surface: '#f0def1'}, dark: {accent: '#dca2dc', surface: '#402b40'}},
  {name: 'menta', light: {accent: '#24735b', surface: '#d6f1e4'}, dark: {accent: '#8bd5b5', surface: '#253c33'}},
  {name: 'terracota', light: {accent: '#955337', surface: '#f5e2d3'}, dark: {accent: '#dab28e', surface: '#40332a'}},
  {name: 'lavanda', light: {accent: '#68549f', surface: '#e7e1f6'}, dark: {accent: '#bdafe4', surface: '#352f43'}},
  {name: 'petróleo', light: {accent: '#326775', surface: '#d7eaf0'}, dark: {accent: '#92c7d3', surface: '#293b40'}},
  {name: 'frambuesa', light: {accent: '#a03b52', surface: '#fadce2'}, dark: {accent: '#eea0b0', surface: '#432b32'}},
  {name: 'musgo', light: {accent: '#4d703b', surface: '#e0eed6'}, dark: {accent: '#add092', surface: '#2e3c28'}},
  {name: 'acero', light: {accent: '#4b637f', surface: '#dfe8f4'}, dark: {accent: '#abc0db', surface: '#2d3540'}},
  {name: 'dorado', light: {accent: '#83611b', surface: '#f8edc7'}, dark: {accent: '#e1c780', surface: '#3e3726'}},
  {name: 'cacao', light: {accent: '#795647', surface: '#eee1d9'}, dark: {accent: '#d3b4a4', surface: '#3a302b'}},
] as const;

export function taskColor(index: number, mode: 'light' | 'dark') {
  return taskPalette[((index % taskPalette.length) + taskPalette.length) % taskPalette.length][mode];
}

/** Contraste y definición exclusivos de tarjetas claras; dark queda intacto. */
export const lightCardTokens = {secondaryText: '#4c5a54', borderOpacity: 0.5, badgeOpacity: 0.08} as const;
