/**
 * MOONIX Central Mission State Hook
 *
 * Provides the `MissionState` object together with setter functions that
 * components call to adjust mission parameters.
 */

import { useState, useCallback } from 'react';
import type { MissionState, AppMode } from '../data/types';

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const DEFAULT_STATE: MissionState = {
  primarySiteId: 'shackleton-rim',
  comparisonSiteId: null,
  missionDate: '2027-03-01',
  landingTime: '12:00',
  analysisWindowDays: 30,
  cursorTime: '2027-03-01T12:00:00Z',
  dateSlipDays: 0,
  powerWeight: 0.6,
  commWeight: 0.4,
  mode: 'planner',
  useTerrainHorizon: true,
};

// ---------------------------------------------------------------------------
// Hook return type
// ---------------------------------------------------------------------------

export interface MissionStateAPI {
  state: MissionState;
  setPrimarySite: (siteId: string) => void;
  setComparisonSite: (siteId: string | null) => void;
  setMissionDate: (date: string) => void;
  setDateSlip: (days: number) => void;
  setWeights: (powerWeight: number, commWeight: number) => void;
  setMode: (mode: AppMode) => void;
  toggleTerrain: () => void;
  setCursorTime: (time: string) => void;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useMissionState(): MissionStateAPI {
  const [state, setState] = useState<MissionState>(DEFAULT_STATE);

  const setPrimarySite = useCallback((siteId: string) => {
    setState((prev) => ({ ...prev, primarySiteId: siteId }));
  }, []);

  const setComparisonSite = useCallback((siteId: string | null) => {
    setState((prev) => ({ ...prev, comparisonSiteId: siteId }));
  }, []);

  const setMissionDate = useCallback((date: string) => {
    setState((prev) => ({
      ...prev,
      missionDate: date,
      cursorTime: `${date}T${prev.landingTime}:00Z`,
    }));
  }, []);

  const setDateSlip = useCallback((days: number) => {
    setState((prev) => ({ ...prev, dateSlipDays: days }));
  }, []);

  const setWeights = useCallback((powerWeight: number, commWeight: number) => {
    setState((prev) => ({ ...prev, powerWeight, commWeight }));
  }, []);

  const setMode = useCallback((mode: AppMode) => {
    setState((prev) => ({ ...prev, mode }));
  }, []);

  const toggleTerrain = useCallback(() => {
    setState((prev) => ({
      ...prev,
      useTerrainHorizon: !prev.useTerrainHorizon,
    }));
  }, []);

  const setCursorTime = useCallback((time: string) => {
    setState((prev) => ({ ...prev, cursorTime: time }));
  }, []);

  return {
    state,
    setPrimarySite,
    setComparisonSite,
    setMissionDate,
    setDateSlip,
    setWeights,
    setMode,
    toggleTerrain,
    setCursorTime,
  };
}
