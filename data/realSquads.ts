// Curated real-player names for prominent teams, in the same shape the pool
// expects: 2 GK, 5 DEF, 5 MID, 3 FWD. Indicative squads (not official call-ups);
// uncurated teams fall back to generated names. Player IDs stay positional
// (`<team>-<POS><n>`) so saved picks survive when names are filled in.

import type { Position } from "./players";

export type SquadNames = Record<Position, string[]>;

export const REAL_SQUADS: Record<string, SquadNames> = {
  argentina: {
    GK: ["Emiliano Martínez", "Gerónimo Rulli"],
    DEF: ["Nahuel Molina", "Cristian Romero", "Nicolás Otamendi", "Nicolás Tagliafico", "Lisandro Martínez"],
    MID: ["Rodrigo De Paul", "Enzo Fernández", "Alexis Mac Allister", "Giovani Lo Celso", "Leandro Paredes"],
    FWD: ["Lionel Messi", "Lautaro Martínez", "Julián Álvarez"],
  },
  brazil: {
    GK: ["Alisson", "Ederson"],
    DEF: ["Danilo", "Marquinhos", "Gabriel Magalhães", "Wendell", "Éder Militão"],
    MID: ["Bruno Guimarães", "Lucas Paquetá", "Casemiro", "André", "Joelinton"],
    FWD: ["Vinícius Júnior", "Rodrygo", "Raphinha"],
  },
  france: {
    GK: ["Mike Maignan", "Brice Samba"],
    DEF: ["Jules Koundé", "William Saliba", "Dayot Upamecano", "Theo Hernández", "Ibrahima Konaté"],
    MID: ["Aurélien Tchouaméni", "Eduardo Camavinga", "Adrien Rabiot", "Warren Zaïre-Emery", "N'Golo Kanté"],
    FWD: ["Kylian Mbappé", "Ousmane Dembélé", "Marcus Thuram"],
  },
  england: {
    GK: ["Jordan Pickford", "Dean Henderson"],
    DEF: ["Kyle Walker", "John Stones", "Marc Guéhi", "Luke Shaw", "Trent Alexander-Arnold"],
    MID: ["Declan Rice", "Jude Bellingham", "Phil Foden", "Cole Palmer", "Conor Gallagher"],
    FWD: ["Harry Kane", "Bukayo Saka", "Anthony Gordon"],
  },
  spain: {
    GK: ["Unai Simón", "David Raya"],
    DEF: ["Dani Carvajal", "Robin Le Normand", "Aymeric Laporte", "Marc Cucurella", "Pau Cubarsí"],
    MID: ["Rodri", "Pedri", "Gavi", "Fabián Ruiz", "Martín Zubimendi"],
    FWD: ["Nico Williams", "Lamine Yamal", "Álvaro Morata"],
  },
  portugal: {
    GK: ["Diogo Costa", "Rui Patrício"],
    DEF: ["João Cancelo", "Rúben Dias", "Pepe", "Nuno Mendes", "António Silva"],
    MID: ["Bruno Fernandes", "Bernardo Silva", "Vitinha", "João Palhinha", "Rúben Neves"],
    FWD: ["Cristiano Ronaldo", "Rafael Leão", "Gonçalo Ramos"],
  },
  germany: {
    GK: ["Marc-André ter Stegen", "Manuel Neuer"],
    DEF: ["Joshua Kimmich", "Antonio Rüdiger", "Jonathan Tah", "David Raum", "Nico Schlotterbeck"],
    MID: ["Pascal Groß", "İlkay Gündoğan", "Jamal Musiala", "Florian Wirtz", "Leon Goretzka"],
    FWD: ["Kai Havertz", "Niclas Füllkrug", "Leroy Sané"],
  },
  netherlands: {
    GK: ["Bart Verbruggen", "Mark Flekken"],
    DEF: ["Denzel Dumfries", "Virgil van Dijk", "Nathan Aké", "Daley Blind", "Stefan de Vrij"],
    MID: ["Frenkie de Jong", "Tijjani Reijnders", "Ryan Gravenberch", "Xavi Simons", "Teun Koopmeiners"],
    FWD: ["Memphis Depay", "Cody Gakpo", "Donyell Malen"],
  },
  belgium: {
    GK: ["Koen Casteels", "Matz Sels"],
    DEF: ["Timothy Castagne", "Wout Faes", "Jan Vertonghen", "Arthur Theate", "Zeno Debast"],
    MID: ["Kevin De Bruyne", "Youri Tielemans", "Amadou Onana", "Leandro Trossard", "Orel Mangala"],
    FWD: ["Romelu Lukaku", "Jérémy Doku", "Loïs Openda"],
  },
  croatia: {
    GK: ["Dominik Livaković", "Ivica Ivušić"],
    DEF: ["Josip Juranović", "Joško Gvardiol", "Josip Šutalo", "Borna Sosa", "Martin Erlić"],
    MID: ["Luka Modrić", "Mateo Kovačić", "Marcelo Brozović", "Mario Pašalić", "Lovro Majer"],
    FWD: ["Andrej Kramarić", "Ante Budimir", "Bruno Petković"],
  },
  usa: {
    GK: ["Matt Turner", "Ethan Horvath"],
    DEF: ["Sergiño Dest", "Chris Richards", "Tim Ream", "Antonee Robinson", "Cameron Carter-Vickers"],
    MID: ["Tyler Adams", "Weston McKennie", "Yunus Musah", "Giovanni Reyna", "Malik Tillman"],
    FWD: ["Christian Pulisic", "Folarin Balogun", "Timothy Weah"],
  },
  mexico: {
    GK: ["Guillermo Ochoa", "Luis Malagón"],
    DEF: ["Jorge Sánchez", "César Montes", "Johan Vásquez", "Jesús Gallardo", "Israel Reyes"],
    MID: ["Edson Álvarez", "Luis Chávez", "Orbelín Pineda", "Luis Romo", "Carlos Rodríguez"],
    FWD: ["Santiago Giménez", "Raúl Jiménez", "Hirving Lozano"],
  },
};
