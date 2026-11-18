import { BBA_VARIANTS_PART_1 } from './bbaTests1';
import { BBA_VARIANTS_PART_2 } from './bbaTests2';
import { BBA_VARIANTS_PART_3 } from './bbaTests3';
import { BbaVariant, QuizQuestion } from '../types/syntax';

export const BBA_VARIANTS: BbaVariant[] = [
  ...BBA_VARIANTS_PART_1,
  ...BBA_VARIANTS_PART_2,
  ...BBA_VARIANTS_PART_3,
];

export const ALL_BBA_QUESTIONS: QuizQuestion[] = BBA_VARIANTS.flatMap(
  (variant) => variant.questions
);
