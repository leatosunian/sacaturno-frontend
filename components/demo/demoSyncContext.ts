"use client";

import { createContext } from "react";
import type { DemoSyncApi } from "./demoSync";

/*
  El contexto va aparte del contrato porque createContext obliga a que el módulo
  sea de cliente, y /demo/stage necesita leer la config desde el servidor.
*/
export const DemoSyncContext = createContext<DemoSyncApi | null>(null);
