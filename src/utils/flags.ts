export const TEAM_FLAGS_MAP: Record<string, string> = {
  'España': '🇪🇸',
  'Brasil': '🇧🇷',
  'Alemania': '🇩🇪',
  'Francia': '🇫🇷',
  'Argentina': '🇦🇷',
  'Portugal': '🇵🇹',
  'Italia': '🇮🇹',
  'Inglaterra': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Países Bajos': '🇳🇱',
  'Holanda': '🇳🇱',
  'Bélgica': '🇧🇪',
  'Croacia': '🇭🇷',
  'Uruguay': '🇺🇾',
  'Colombia': '🇨🇴',
  'México': '🇲🇽',
  'Chile': '🇨🇱',
  'Estados Unidos': '🇺🇸',
  'EE.UU.': '🇺🇸',
  'EEUU': '🇺🇸',
  'Canadá': '🇨🇦',
  'Marruecos': '🇲🇦',
  'Senegal': '🇸🇳',
  'Japón': '🇯🇵',
  'Corea del Sur': '🇰🇷',
  'Australia': '🇦🇺',
  'Suiza': '🇨🇭',
  'Suecia': '🇸🇪',
  'Polonia': '🇵🇱',
  'Dinamarca': '🇩🇰',
  'Ucrania': '🇺🇦',
  'Turquía': '🇹🇷',
  'Gales': '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
  'Escocia': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'Ecuador': '🇪🇨',
  'Perú': '🇵🇪',
  'Venezuela': '🇻🇪',
  'Paraguay': '🇵🇾',
  'Bolivia': '🇧🇴',
  'Arabia Saudí': '🇸🇦',
  'Arabia Saudita': '🇸🇦',
  'Irán': '🇮🇷',
  'Costa Rica': '🇨🇷',
  'Camerún': '🇨🇲',
  'Ghana': '🇬🇭',
  'Túnez': '🇹🇳',
  'Catar': '🇶🇦',
  'Qatar': '🇶🇦',
  'España 🇪🇸': '🇪🇸',
  'Brasil 🇧🇷': '🇧🇷',
  'Alemania 🇩🇪': '🇩🇪',
  'Francia 🇫🇷': '🇫🇷',
  'Argentina 🇦🇷': '🇦🇷',
  'Portugal 🇵🇹': '🇵🇹',
  'México 🇲🇽': '🇲🇽'
};

/**
 * Normalizes a team name and finds its associated flag emoji.
 * If no specific map is found, returns a soccer ball emoji ⚽.
 */
export function getTeamFlag(teamName: string): string {
  if (!teamName) return '⚽';
  const name = teamName.trim();
  
  // Direct dictionary checkout first
  if (TEAM_FLAGS_MAP[name]) {
    return TEAM_FLAGS_MAP[name];
  }

  // Case-insensitive / substring checks
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('españa') || lowerName.includes('spain')) return '🇪🇸';
  if (lowerName.includes('brasil') || lowerName.includes('brazil')) return '🇧🇷';
  if (lowerName.includes('alemania') || lowerName.includes('germany')) return '🇩🇪';
  if (lowerName.includes('francia') || lowerName.includes('france')) return '🇫🇷';
  if (lowerName.includes('argentina')) return '🇦🇷';
  if (lowerName.includes('portugal')) return '🇵🇹';
  if (lowerName.includes('italia') || lowerName.includes('italy')) return '🇮🇹';
  if (lowerName.includes('inglaterra') || lowerName.includes('england')) return '🏴󠁧󠁢󠁥󠁮󠁧󠁿';
  if (lowerName.includes('países bajos') || lowerName.includes('paises bajos') || lowerName.includes('holanda') || lowerName.includes('netherlands')) return '🇳🇱';
  if (lowerName.includes('bélgica') || lowerName.includes('belgica') || lowerName.includes('belgium')) return '🇧🇪';
  if (lowerName.includes('croacia') || lowerName.includes('croatia')) return '🇭🇷';
  if (lowerName.includes('uruguay')) return '🇺🇾';
  if (lowerName.includes('colombia')) return '🇨🇴';
  if (lowerName.includes('méxico') || lowerName.includes('mexico')) return '🇲🇽';
  if (lowerName.includes('chile')) return '🇨🇱';
  if (lowerName.includes('estados unidos') || lowerName.includes('ee.uu') || lowerName.includes('usa') || lowerName.includes('united states')) return '🇺🇸';
  if (lowerName.includes('canadá') || lowerName.includes('canada')) return '🇨🇦';
  if (lowerName.includes('marruecos') || lowerName.includes('morocco')) return '🇲🇦';
  if (lowerName.includes('senegal')) return '🇸🇳';
  if (lowerName.includes('japón') || lowerName.includes('japon') || lowerName.includes('japan')) return '🇯🇵';
  if (lowerName.includes('corea')) return '🇰🇷';
  if (lowerName.includes('australia')) return '🇦🇺';
  if (lowerName.includes('suiza') || lowerName.includes('switzerland')) return '🇨🇭';
  if (lowerName.includes('suecia') || lowerName.includes('sweden')) return '🇸🇪';
  if (lowerName.includes('polonia') || lowerName.includes('poland')) return '🇵🇱';
  if (lowerName.includes('dinamarca') || lowerName.includes('denmark')) return '🇩🇰';
  if (lowerName.includes('ucrania') || lowerName.includes('ukraine')) return '🇺🇦';
  if (lowerName.includes('turquía') || lowerName.includes('turquia') || lowerName.includes('turkey')) return '🇹🇷';
  if (lowerName.includes('gales') || lowerName.includes('wales')) return '🏴󠁧󠁢󠁷󠁬󠁳󠁿';
  if (lowerName.includes('escocia') || lowerName.includes('scotland')) return '🏴󠁧󠁢󠁳󠁣󠁴󠁿';
  if (lowerName.includes('ecuador')) return '🇪🇨';
  if (lowerName.includes('perú') || lowerName.includes('peru')) return '🇵🇪';
  if (lowerName.includes('venezuela')) return '🇻🇪';
  if (lowerName.includes('paraguay')) return '🇵🇾';
  if (lowerName.includes('bolivia')) return '🇧🇴';
  if (lowerName.includes('arabia')) return '🇸🇦';
  if (lowerName.includes('irán') || lowerName.includes('iran')) return '🇮🇷';
  if (lowerName.includes('costa rica')) return '🇨🇷';
  if (lowerName.includes('camerún') || lowerName.includes('camerun') || lowerName.includes('cameroon')) return '🇨🇲';
  if (lowerName.includes('ghana')) return '🇬🇭';
  if (lowerName.includes('túnez') || lowerName.includes('tunez') || lowerName.includes('tunisia')) return '🇹🇳';
  if (lowerName.includes('catar') || lowerName.includes('qatar')) return '🇶🇦';

  return '⚽';
}

/**
 * Returns formatted string with flag if not already containing an emoji or similar.
 */
export function formatTeamWithFlag(teamName: string): string {
  if (!teamName) return '';
  const flag = getTeamFlag(teamName);
  
  // If the team name already contains standard emoji characters or flags, we don't duplicate it.
  const nameTrimmed = teamName.trim();
  const hasEmoji = /[\uD800-\uDBFF][\uDC00-\uDFFF]|\p{Emoji}/u.test(nameTrimmed);
  if (hasEmoji) {
    return nameTrimmed;
  }
  
  return `${nameTrimmed} ${flag}`;
}
