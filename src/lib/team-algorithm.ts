import type { Participant } from '@/types/session';

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function assignTeams(
  participants: Participant[],
  numberOfTeams: number
): { teamName: string; memberIds: string[]; memberNames: string[] }[] {
  const shuffled = shuffleArray(participants);
  const teams: { teamName: string; memberIds: string[]; memberNames: string[] }[] = [];

  for (let i = 0; i < numberOfTeams; i++) {
    teams.push({
      teamName: `${i + 1}조`,
      memberIds: [],
      memberNames: [],
    });
  }

  shuffled.forEach((participant, index) => {
    const teamIndex = index % numberOfTeams;
    teams[teamIndex].memberIds.push(participant.id);
    teams[teamIndex].memberNames.push(participant.name);
  });

  return teams;
}
