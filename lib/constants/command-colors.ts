import { z } from "zod";

export const COMMAND_COLORS = [
  "blue",
  "green",
  "red",
  "yellow",
  "violet",
  "slate",
] as const;

export type CommandColor = (typeof COMMAND_COLORS)[number];

export const commandColorSchema = z.enum(COMMAND_COLORS);

export const COMMAND_COLOR_LABELS: Record<CommandColor, string> = {
  blue: "Azul",
  green: "Verde",
  red: "Vermelho",
  yellow: "Amarelo",
  violet: "Violeta",
  slate: "Cinza",
};

/** Classes Tailwind explícitas para não serem purgadas */
export const COMMAND_COLOR_STYLES: Record<
  CommandColor,
  { button: string; card: string }
> = {
  blue: {
    button:
      "bg-blue-600 text-white hover:bg-blue-600/90 focus-visible:ring-blue-600/40",
    card: "border-t-4 border-blue-600 bg-blue-500/[0.09] ring-1 ring-blue-500/25 dark:bg-blue-950/55 dark:ring-blue-400/20",
  },
  green: {
    button:
      "bg-green-600 text-white hover:bg-green-600/90 focus-visible:ring-green-600/40",
    card: "border-t-4 border-green-600 bg-green-500/[0.09] ring-1 ring-green-500/25 dark:bg-green-950/55 dark:ring-green-400/20",
  },
  red: {
    button:
      "bg-red-600 text-white hover:bg-red-600/90 focus-visible:ring-red-600/40",
    card: "border-t-4 border-red-600 bg-red-500/[0.09] ring-1 ring-red-500/25 dark:bg-red-950/55 dark:ring-red-400/20",
  },
  yellow: {
    button:
      "bg-amber-500 text-amber-950 hover:bg-amber-500/90 focus-visible:ring-amber-500/40",
    card: "border-t-4 border-amber-500 bg-amber-500/[0.14] ring-1 ring-amber-500/30 dark:bg-amber-950/50 dark:ring-amber-400/25",
  },
  violet: {
    button:
      "bg-violet-600 text-white hover:bg-violet-600/90 focus-visible:ring-violet-600/40",
    card: "border-t-4 border-violet-600 bg-violet-500/[0.09] ring-1 ring-violet-500/25 dark:bg-violet-950/55 dark:ring-violet-400/20",
  },
  slate: {
    button:
      "bg-slate-600 text-white hover:bg-slate-600/90 focus-visible:ring-slate-600/40",
    card: "border-t-4 border-slate-600 bg-slate-500/[0.09] ring-1 ring-slate-500/25 dark:bg-slate-900/60 dark:ring-slate-400/20",
  },
};
