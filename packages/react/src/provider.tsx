"use client";

import { createDevi, type DeviOps, type DeviWorkerType } from "@devi/core";
import React, { createContext, useContext, useMemo } from "react";
import { registerDeviOps } from "./context";

const DeviContext = createContext<DeviOps | undefined>(undefined);

export type DeviProviderProps = {
  /** Runtime worker type. Defaults to `'web'`. */
  type?: DeviWorkerType;
  children: React.ReactNode;
};

/**
 * Provides a devi cache instance to the React tree.
 *
 * Follows the same pattern as TanStack Query's `QueryClientProvider`:
 * create the client once, put it in context, and expose a hook that throws
 * when used outside the provider.
 *
 * @example
 * ```tsx
 * <DeviProvider>
 *   <App />
 * </DeviProvider>
 * ```
 */
export function DeviProvider({ type = "web", children }: DeviProviderProps) {
  const ops = useMemo(() => {
    const instance = createDevi(type);
    registerDeviOps(instance);
    return instance;
  }, [type]);

  return (
    <DeviContext.Provider value={ops}>{children}</DeviContext.Provider>
  );
}

/** Access the devi cache instance from a child component. */
export function useDevi(): DeviOps {
  const ops = useContext(DeviContext);
  if (!ops) {
    throw new Error("useDevi must be used within DeviProvider");
  }
  return ops;
}
