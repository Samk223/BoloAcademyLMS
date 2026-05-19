// resources/js/utils/theme.js

// 3. The "Secret Sauce" (Tailwind CSS Classes)
export const brutalBorder = "border-[3px] border-[#1E1E1E]";
export const brutalShadow = "shadow-[4px_4px_0px_0px_#1E1E1E]";
export const brutalShadowSm = "shadow-[3px_3px_0px_0px_#1E1E1E]";
export const brutalHover = "hover:translate-y-[3px] hover:translate-x-[3px] hover:shadow-none transition-all duration-200";

// Standard combined string for containers/cards
export const brutalCard = `${brutalBorder} ${brutalShadow} bg-white rounded-3xl`;
export const brutalButton = `${brutalBorder} ${brutalShadowSm} ${brutalHover} font-black rounded-xl`;

// Color constants
export const colors = {
  ink: "#1E1E1E",
  canvas: "#FFF8E7",
  mint: "#D1F2EB",
  peach: "#FFE5D9",
  purple: "#E9D5FF",
  lemon: "#FEF08A",
  pink: "#FBCFE8",
  blue: "#BFDBFE",
};
