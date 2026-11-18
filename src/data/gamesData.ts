export {
  SENTENCE_BUILDER_ITEMS,
  PART_HUNTER_ITEMS,
  PUNCTUATION_ITEMS,
  PAIR_MATCH_ITEMS,
} from './gamesDataPart1';

export {
  ERROR_FINDER_ITEMS,
  CLAUSE_DETECTIVE_ITEMS,
  DIRECT_INDIRECT_ITEMS,
  BLITZ_EXTRA_QUESTIONS,
  CASTLE_FLOORS,
} from './gamesDataPart2';

export interface GameMeta {
  id:
    | 'gap_quruvchi'
    | 'bolak_ovchisi'
    | 'tinish_ustaxonasi'
    | 'juftini_top'
    | 'xatoni_top'
    | 'blits_bellashuv'
    | 'ergash_detektivi'
    | 'kochirma_ozlashtirma'
    | 'sintaksis_qalasi';
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  xpReward: number;
  accent: string;
}

export const GAMES_CATALOG: GameMeta[] = [
  {
    id: 'gap_quruvchi',
    title: 'Gap quruvchi',
    subtitle: 'So‘zlardan gap yig‘ing',
    description: 'Aralashgan so‘zlarni sudrab yoki bosib, to‘g‘ri sintaktik tartibda joylashtiring.',
    icon: '🧱',
    xpReward: 40,
    accent: 'from-indigo-500 to-blue-600',
  },
  {
    id: 'bolak_ovchisi',
    title: 'Bo‘lak ovchisi',
    subtitle: 'Ranglar bilan tahlil qiling',
    description: 'Gapdagi so‘zlarni bosib, Ega, Kesim, To‘ldiruvchi, Aniqlovchi va Hol rangiga bo‘yang.',
    icon: '🎯',
    xpReward: 45,
    accent: 'from-rose-500 to-orange-500',
  },
  {
    id: 'tinish_ustaxonasi',
    title: 'Tinish belgilari ustaxonasi',
    subtitle: 'Punktuatsiya mahorati',
    description: 'Matndagi bo‘sh o‘rinlarga vergul, tire, ikki nuqta va boshqa belgilarni joylang.',
    icon: '✒️',
    xpReward: 45,
    accent: 'from-teal-500 to-emerald-600',
  },
  {
    id: 'juftini_top',
    title: 'Juftini top',
    subtitle: 'Xotira va bog‘lanish',
    description: 'So‘z birikmasi va sintaktik tushuncha juftliklarini xotirada toping.',
    icon: '🃏',
    xpReward: 40,
    accent: 'from-amber-500 to-yellow-600',
  },
  {
    id: 'xatoni_top',
    title: 'Xatoni top',
    subtitle: 'Sintaktik tuzatuvchi',
    description: 'Gapdagi sintaktik yoki tinish belgisi xatosini toping va to‘g‘ri variantga almashtiring.',
    icon: '🔍',
    xpReward: 45,
    accent: 'from-violet-500 to-purple-600',
  },
  {
    id: 'blits_bellashuv',
    title: 'Blits-bellashuv',
    subtitle: '60 soniyalik tezkor sinov',
    description: 'Bir daqiqada iloji boricha ko‘proq savolga javob bering va kombo ballar yig‘ing!',
    icon: '⚡',
    xpReward: 60,
    accent: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'ergash_detektivi',
    title: 'Ergash gap detektivi',
    subtitle: 'Qo‘shma gap tergovi',
    description: 'Qo‘shma gapdagi ergash gapning aniq ma’no turini (sabab, maqsad, shart...) aniqlang.',
    icon: '🕵️',
    xpReward: 50,
    accent: 'from-fuchsia-500 to-pink-600',
  },
  {
    id: 'kochirma_ozlashtirma',
    title: 'Ko‘chirma → O‘zlashtirma',
    subtitle: 'Nutqni qayta qurish',
    description: 'Ko‘chirma gaplarni qoidalarga mos ravishda o‘zlashtirma gapga aylantiring.',
    icon: '🔄',
    xpReward: 50,
    accent: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'sintaksis_qalasi',
    title: 'Sintaksis qal’asi',
    subtitle: '5 qavatli sarguzasht',
    description: '3 ta yurakcha bilan 5 qavatdan o‘ting va oxirida Bosh Boss savollarini yenging!',
    icon: '🏰',
    xpReward: 120,
    accent: 'from-indigo-600 via-purple-600 to-rose-600',
  },
];
