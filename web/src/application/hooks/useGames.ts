import { useMemo } from "react";
import {
  useGetSudokuStagesQuery,
  useGetSudokuStageByIdQuery,
  useGetSudokuLeaderboardQuery,
  useSubmitSudokuRecordMutation,
} from "@/infrastructure/rtk/api/game.api";
import { gameMapper } from "@/application/mappers/game.mapper";

export const useGames = () => {
  const [submitRecord, { isLoading: isCreating }] = useSubmitSudokuRecordMutation();

  const createSudokuRecord = async (stageId: string, timeTaken: number, mistakes: number, status: 'won' | 'lost') => {
    const res = await submitRecord({ stageId, timeTaken, mistakes, status }).unwrap();
  };

  return { createSudokuRecord, isCreating };
};

export const useSudokuStages = () => {
  const { data: dtoData, isLoading, error, refetch } = useGetSudokuStagesQuery();
  const data = useMemo(() => dtoData ? gameMapper.toStageEntities(dtoData) : [], [dtoData]);
  return { data, isLoading, error, refetch };
};

export const useSudokuStageDetail = (id: string, skip = false) => {
  const { data: dto, isLoading, error } = useGetSudokuStageByIdQuery(id, { skip });
  const data = useMemo(() => dto ? gameMapper.toStageDetailEntity(dto) : undefined, [dto]);
  return { data, isLoading, error };
};

export const useSudokuLeaderboard = (difficulty?: string, skip = false) => {
  const { data: dtoData, isLoading, error, refetch } = useGetSudokuLeaderboardQuery(difficulty || undefined, { skip });
  const data = useMemo(() => dtoData ? gameMapper.toLeaderboardEntities(dtoData) : [], [dtoData]);
  return { data, isLoading, error, refetch };
};
