import type {Theme, CSSObject} from '@mui/material/styles';
type Style = (props: {theme: Theme}) => CSSObject;
export const laboratoryStyles: Style = ({theme}) => ({
  "&": {
    "margin": "0",
  },
  "& *": {
    "boxSizing": "border-box",
  },
  "& main": {
    "maxWidth": "1120px",
    "margin": "auto",
    "padding": "48px 24px",
  },
  "& header": {
    "marginBottom": "36px",
    "maxWidth": "760px",
  },
  "& h1": {
    "fontSize": "clamp(32px,5vw,52px)",
    "letterSpacing": "-2px",
    "lineHeight": "1.06",
    "margin": "14px 0",
  },
  "& h2": {
    "fontSize": "23px",
    "marginTop": "0",
  },
  "& h3": {
    "fontSize": "17px",
  },
  "& p": {
    "lineHeight": "1.6",
  },
  "& .eyebrow": {
    "letterSpacing": "2px",
    "fontSize": "12px",
    "fontWeight": "bold",
  },
  "& .tag": {
    "display": "inline-block",
    "border": `1px solid ${theme.palette.divider}`,
    "borderRadius": "30px",
    "padding": "7px 12px",
    "fontSize": "12px",
  },
  "& .panel": {
    "background": theme.palette.background.paper,
    "border": `1px solid ${theme.palette.divider}`,
    "borderRadius": "16px",
    "padding": "28px",
    "margin": "20px 0",
  },
  "& .casegrid": {
    "display": "grid",
    "gridTemplateColumns": "repeat(auto-fit,minmax(175px,1fr))",
    "gap": "10px",
    "marginBottom": "24px",
  },
  "& button": {
    "font": "inherit",
    "border": `1px solid ${theme.palette.divider}`,
    "background": theme.palette.background.default,
    "borderRadius": "10px",
    "padding": "14px",
    "cursor": "pointer",
    "textAlign": "left",
    "color": "inherit",
  },
  "& .lab-actions": {display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 22},
  "& .lab-actions .primary": {marginTop: 0},
  "& .checkbox-label": {display: 'flex', alignItems: 'center', gap: 8},
  "& .checkbox-label input": {width: 'auto', marginTop: 0},
  "& button:disabled": {opacity: .5, cursor: 'not-allowed'},
  "& a": {color: theme.palette.primary.main},
  "& a:focus-visible": {outline: `3px solid ${theme.palette.primary.light}`, outlineOffset: 3},
  "& button:hover": {
    "borderColor": theme.palette.primary.main,
  },
  "& button:focus-visible,& input:focus-visible,& select:focus-visible": {
    "outline": `3px solid ${theme.palette.primary.light}`,
    "outlineOffset": "3px",
  },
  "& .selected": {
    "background": theme.palette.action.selected,
    "border": `2px solid ${theme.palette.primary.main}`,
  },
  "& .casegrid small": {
    "display": "block",
    "color": theme.palette.text.secondary,
    "marginBottom": "8px",
  },
  "& label": {
    "display": "block",
    "fontSize": "13px",
    "fontWeight": "bold",
    "margin": "12px 0",
  },
  "& select,& input": {
    "display": "block",
    "width": "100%",
    "padding": "11px",
    "border": `1px solid ${theme.palette.divider}`,
    "borderRadius": "6px",
    "font": "inherit",
    "background": theme.palette.background.paper,
    "color": "inherit",
    "marginTop": "7px",
  },
  "& .factgrid": {
    "display": "grid",
    "gridTemplateColumns": "repeat(3,1fr)",
    "gap": "16px",
  },
  "& .factgrid article": {
    "padding": "16px",
    "borderRadius": "10px",
    "background": theme.palette.background.default,
  },
  "& .factgrid p,& .muted,& footer": {
    "fontSize": "13px",
    "color": theme.palette.text.secondary,
  },
  "& .primary": {
    "background": theme.palette.primary.main,
    "color": theme.palette.primary.contrastText,
    "marginTop": "22px",
    "padding": "14px 24px",
    "border": "0",
  },
  "& .error": {
    "color": theme.palette.error.main,
  },
  "& .result": {
    "display": "flex",
    "flexWrap": "wrap",
    "justifyContent": "space-between",
    "background": theme.palette.action.selected,
    "borderRadius": "10px",
    "padding": "22px",
    "fontSize": "22px",
  },
  "& .result span": {
    "fontSize": "18px",
  },
  "& .tablewrap": {
    "overflow": "auto",
  },
  "& table": {
    "borderCollapse": "collapse",
    "width": "100%",
    "fontSize": "13px",
    "textAlign": "left",
  },
  "& th,& td": {
    "padding": "12px",
    "borderBottom": `1px solid ${theme.palette.divider}`,
    "verticalAlign": "top",
  },
  "& th": {
    "color": theme.palette.text.secondary,
    "background": theme.palette.background.default,
  },
  "& .step": {
    "borderLeft": `3px solid ${theme.palette.primary.main}`,
    "padding": "10px 18px",
    "margin": "14px 0",
    "background": theme.palette.background.default,
  },
  "& details": {
    "marginTop": "20px",
  },
  "& summary": {
    "cursor": "pointer",
    "fontWeight": "bold",
  },
  "& footer": {
    "padding": "20px 0",
  },
  "@media(max-width:650px)": {
    "& main": {
      "padding": "24px 14px",
    },
    "& .panel": {
      "padding": "20px 15px",
    },
    "& .factgrid": {
      "gridTemplateColumns": "1fr",
    },
    "& h1": {
      "letterSpacing": "-1px",
    },
  },
});
