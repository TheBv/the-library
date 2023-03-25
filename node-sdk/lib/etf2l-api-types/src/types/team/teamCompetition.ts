import type { CompetitionResultsDivision } from "types/competition/competitionResultsDivision";

export type TeamCompetition = {
  [competitionId: string]: {
    category: string;
    competition: string;
    division: Omit<CompetitionResultsDivision, "id">;
    url: string;
  }
};