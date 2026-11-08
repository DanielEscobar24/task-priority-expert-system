import type { Metadata } from 'next';
import AppThemeProvider from '../theme/ThemeProvider';
export const metadata: Metadata={title:'Calendario | Task Priority',description:'Valida hechos, reglas y certeza del sistema experto.'};
export default function Layout({children}:{children:React.ReactNode}) {return <html lang="es"><body><AppThemeProvider>{children}</AppThemeProvider></body></html>}
