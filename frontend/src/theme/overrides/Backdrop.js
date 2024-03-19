import { alpha } from "@mui/material/styles";

export default function Backdrop(theme) {
  const varLow = alpha(theme.palette.grey[900], 0.48);
  return {
    MuiBackdrop: {
      styleOverrides: {
        root: {
          background: [`${varLow}`],
          "&.MuiBackdrop-invisible": {
            background: "transparent",
          },
        },
      },
    },
  };
}
