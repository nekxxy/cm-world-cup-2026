// The 48 FIFA World Cup 2026 teams.
//
// `group` (A–L, 12 groups of 4) reflects the tournament draw and is easy to
// amend if the official draw differs — update the `group` field only.
//
// `primary` / `secondary` are each team's brand colours (kit / flag), used for
// ACCENTS and HEADERS only. Body text never sits directly on these — see
// `theme/useTeamTheme.ts` — so a bright team (yellow, orange) can't blow out
// text. The theming layer computes a legible on-colour for each.

export type GroupId =
  | "A" | "B" | "C" | "D" | "E" | "F"
  | "G" | "H" | "I" | "J" | "K" | "L";

export interface Team {
  /** Stable slug used as the theme id, e.g. "argentina". */
  id: string;
  name: string;
  /** 3-letter FIFA country code. */
  code: string;
  group: GroupId;
  /** Brand colour for headers / primary accents. */
  primary: string;
  /** Brand colour for secondary accents. */
  secondary: string;
}

export const TEAMS: Team[] = [
  // Hosts
  { id: "usa", name: "United States", code: "USA", group: "A", primary: "#0A3161", secondary: "#B31942" },
  { id: "canada", name: "Canada", code: "CAN", group: "B", primary: "#C8102E", secondary: "#1D1D1D" },
  { id: "mexico", name: "Mexico", code: "MEX", group: "C", primary: "#006847", secondary: "#CE1126" },

  // CONMEBOL
  { id: "argentina", name: "Argentina", code: "ARG", group: "D", primary: "#6CACE4", secondary: "#FCBF49" },
  { id: "brazil", name: "Brazil", code: "BRA", group: "E", primary: "#009C3B", secondary: "#FFDF00" },
  { id: "uruguay", name: "Uruguay", code: "URU", group: "F", primary: "#5CBFEB", secondary: "#FCD116" },
  { id: "colombia", name: "Colombia", code: "COL", group: "G", primary: "#FCD116", secondary: "#003893" },
  { id: "ecuador", name: "Ecuador", code: "ECU", group: "H", primary: "#FFDD00", secondary: "#034EA2" },
  { id: "paraguay", name: "Paraguay", code: "PAR", group: "I", primary: "#D52B1E", secondary: "#0038A8" },

  // UEFA
  { id: "france", name: "France", code: "FRA", group: "J", primary: "#0055A4", secondary: "#EF4135" },
  { id: "england", name: "England", code: "ENG", group: "K", primary: "#CF142B", secondary: "#1D3461" },
  { id: "spain", name: "Spain", code: "ESP", group: "L", primary: "#AA151B", secondary: "#F1BF00" },
  { id: "portugal", name: "Portugal", code: "POR", group: "A", primary: "#046A38", secondary: "#DA291C" },
  { id: "germany", name: "Germany", code: "GER", group: "B", primary: "#DD0000", secondary: "#1D1D1D" },
  { id: "netherlands", name: "Netherlands", code: "NED", group: "C", primary: "#F36C21", secondary: "#21468B" },
  { id: "belgium", name: "Belgium", code: "BEL", group: "D", primary: "#E30613", secondary: "#1D1D1D" },
  { id: "croatia", name: "Croatia", code: "CRO", group: "E", primary: "#C8102E", secondary: "#1D3461" },
  { id: "switzerland", name: "Switzerland", code: "SUI", group: "F", primary: "#D52B1E", secondary: "#1D1D1D" },
  { id: "denmark", name: "Denmark", code: "DEN", group: "G", primary: "#C8102E", secondary: "#1D3461" },
  { id: "austria", name: "Austria", code: "AUT", group: "H", primary: "#ED2939", secondary: "#1D1D1D" },
  { id: "serbia", name: "Serbia", code: "SRB", group: "I", primary: "#C6363C", secondary: "#11457E" },
  { id: "poland", name: "Poland", code: "POL", group: "J", primary: "#DC143C", secondary: "#1D3461" },
  { id: "norway", name: "Norway", code: "NOR", group: "K", primary: "#BA0C2F", secondary: "#00205B" },
  { id: "turkey", name: "Türkiye", code: "TUR", group: "L", primary: "#E30A17", secondary: "#1D1D1D" },
  { id: "italy", name: "Italy", code: "ITA", group: "A", primary: "#0072BB", secondary: "#1D1D1D" },
  { id: "scotland", name: "Scotland", code: "SCO", group: "B", primary: "#005EB8", secondary: "#1D1D1D" },

  // CAF
  { id: "morocco", name: "Morocco", code: "MAR", group: "C", primary: "#C1272D", secondary: "#006233" },
  { id: "senegal", name: "Senegal", code: "SEN", group: "D", primary: "#00853F", secondary: "#E31B23" },
  { id: "egypt", name: "Egypt", code: "EGY", group: "E", primary: "#CE1126", secondary: "#1D1D1D" },
  { id: "algeria", name: "Algeria", code: "ALG", group: "F", primary: "#006233", secondary: "#D21034" },
  { id: "tunisia", name: "Tunisia", code: "TUN", group: "G", primary: "#E70013", secondary: "#1D1D1D" },
  { id: "nigeria", name: "Nigeria", code: "NGA", group: "H", primary: "#008751", secondary: "#1D1D1D" },
  { id: "ivory-coast", name: "Côte d'Ivoire", code: "CIV", group: "I", primary: "#FF8200", secondary: "#009639" },
  { id: "cameroon", name: "Cameroon", code: "CMR", group: "J", primary: "#007A5E", secondary: "#FCD116" },
  { id: "ghana", name: "Ghana", code: "GHA", group: "K", primary: "#006B3F", secondary: "#FCD116" },

  // AFC
  { id: "japan", name: "Japan", code: "JPN", group: "L", primary: "#BC002D", secondary: "#1D3461" },
  { id: "south-korea", name: "South Korea", code: "KOR", group: "A", primary: "#003478", secondary: "#CD2E3A" },
  { id: "iran", name: "Iran", code: "IRN", group: "B", primary: "#239F40", secondary: "#DA0000" },
  { id: "saudi-arabia", name: "Saudi Arabia", code: "KSA", group: "C", primary: "#006C35", secondary: "#1D1D1D" },
  { id: "australia", name: "Australia", code: "AUS", group: "D", primary: "#00843D", secondary: "#FFCD00" },
  { id: "qatar", name: "Qatar", code: "QAT", group: "E", primary: "#8A1538", secondary: "#1D1D1D" },
  { id: "uzbekistan", name: "Uzbekistan", code: "UZB", group: "F", primary: "#1EB53A", secondary: "#0072CE" },
  { id: "iraq", name: "Iraq", code: "IRQ", group: "G", primary: "#007A3D", secondary: "#CE1126" },

  // CONCACAF
  { id: "costa-rica", name: "Costa Rica", code: "CRC", group: "H", primary: "#002B7F", secondary: "#CE1126" },
  { id: "panama", name: "Panama", code: "PAN", group: "I", primary: "#005293", secondary: "#D21034" },
  { id: "jamaica", name: "Jamaica", code: "JAM", group: "J", primary: "#009B3A", secondary: "#FED100" },
  { id: "honduras", name: "Honduras", code: "HON", group: "L", primary: "#0073CF", secondary: "#1D1D1D" },

  // OFC
  { id: "new-zealand", name: "New Zealand", code: "NZL", group: "K", primary: "#1D1D1D", secondary: "#C8102E" },
];

export const TEAMS_BY_ID: Record<string, Team> = Object.fromEntries(
  TEAMS.map((t) => [t.id, t]),
);

export function getTeam(id: string | null | undefined): Team | undefined {
  return id ? TEAMS_BY_ID[id] : undefined;
}
