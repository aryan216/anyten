"use client";

import { useQueryStates } from "nuqs";
import { ExecutionsParams } from "../params";

export const useExecutionsParams = () => {
  return useQueryStates(ExecutionsParams);
};

