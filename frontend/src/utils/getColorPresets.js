// theme
import palette from "../theme/palette";

export const colorPresets = [
  // DEFAULT
  {
    name: "default",
    ...palette.light.primary,
  },
    // PINK
    {
      name: "pink",
      lighter: "#ffe7e9",
      light: "#ff6883",
      main: "#FE3E6D",
      dark: "#FE3E6D",
      darker: "#dc4867",
      contrastText: "#fff",
    },
  // PURPLE
  {
    name: "purple",
    lighter: "#EBD6FD",
    light: "#B985F4",
    main: "#7635dc",
    dark: "#431A9E",
    darker: "#200A69",
    contrastText: "#fff",
  },
  // CYAN
  {
    name: "cyan",
    lighter: "#D1FFFC",
    light: "#76F2FF",
    main: "#1CCAFF",
    dark: "#0E77B7",
    darker: "#053D7A",
    contrastText: palette.light.grey[800],
  },
  // BLUE
  {
    name: "blue",
    lighter: "#D1E9FC",
    light: "#76B0F1",
    main: "#2065D1",
    dark: "#103996",
    darker: "#061B64",

    contrastText: "#fff",
  },
  // ORANGE
  {
    name: "orange",
    lighter: "#FEF4D4",
    light: "#FED680",
    main: "#fda92d",
    dark: "#B66816",
    darker: "#793908",
    contrastText: palette.light.grey[800],
  },
  // RED
  {
    name: "red",
    lighter: "#FFE3D5",
    light: "#FFC1AC",
    main: "#FF3030",
    dark: "#B71833",
    darker: "#7A0930",
    contrastText: "#fff",
  },
];

export const pinkPreset = colorPresets[1];
export const defaultPreset = colorPresets[0];
export const purplePreset = colorPresets[2];
export const cyanPreset = colorPresets[3];
export const bluePreset = colorPresets[4];
export const orangePreset = colorPresets[5];
export const redPreset = colorPresets[6];

export default function getColorPresets(presetsKey) {
  return {
    pink: pinkPreset,
    purple: purplePreset,
    cyan: cyanPreset,
    blue: bluePreset,
    orange: orangePreset,
    red: redPreset,
    default: defaultPreset,
  }[presetsKey];
}
