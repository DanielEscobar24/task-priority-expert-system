'use client';
import {createContext,useContext,useMemo,useState} from 'react';
import {ThemeProvider,createTheme,CssBaseline} from '@mui/material';
import {AppRouterCacheProvider} from '@mui/material-nextjs/v15-appRouter';
import {appPalette} from './palette';
const Context=createContext({mode:'light' as 'light'|'dark',toggleMode:()=>{}});
export const useAppTheme=()=>useContext(Context);
export default function AppThemeProvider({children}:{children:React.ReactNode}){
 const [mode,setMode]=useState<'light'|'dark'>('light');
 const theme=useMemo(()=>{const p=appPalette[mode];return createTheme({palette:{mode,background:{default:p.background,paper:p.surface},text:{primary:p.text,secondary:p.muted},primary:{main:p.primary,light:p.primaryLight,dark:p.primaryDark,contrastText:p.onPrimary},divider:p.border,action:{selected:p.selected,hover:p.hover},error:{main:p.error}},typography:{fontFamily:'Arial, Helvetica, sans-serif'}});},[mode]);
 return <AppRouterCacheProvider><Context.Provider value={{mode,toggleMode:()=>setMode(v=>v==='light'?'dark':'light')}}><ThemeProvider theme={theme}><CssBaseline/>{children}</ThemeProvider></Context.Provider></AppRouterCacheProvider>;
}
