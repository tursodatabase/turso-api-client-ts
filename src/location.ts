import { TursoConfig } from "./config";
import { TursoClient } from "./client";

export type LocationKeys = {
  ams: string;
  arn: string;
  bog: string;
  bos: string;
  cdg: string;
  den: string;
  dfw: string;
  ewr: string;
  fra: string;
  gdl: string;
  gig: string;
  gru: string;
  hkg: string;
  iad: string;
  jnb: string;
  lax: string;
  lhr: string;
  mad: string;
  mia: string;
  nrt: string;
  ord: string;
  otp: string;
  qro: string;
  scl: string;
  sea: string;
  sin: string;
  sjc: string;
  syd: string;
  waw: string;
  yul: string;
  yyz: string;
  [key: string]: string;
};

export type Location = {
  [K in keyof LocationKeys]: { code: K; description: LocationKeys[K] };
}[keyof LocationKeys];

export interface ClosestLocation {
  server: keyof LocationKeys;
  client: keyof LocationKeys;
}

export class LocationClient {
  constructor(private config: TursoConfig) {}

  async list(): Promise<Location[]> {
    const response = await TursoClient.request<{
      locations: LocationKeys;
    }>("locations", this.config);

    if (!response.locations) {
      return [];
    }

    return Object.entries(response.locations).map(([code, description]) => ({
      code,
      description,
    }));
  }

  async closest(): Promise<ClosestLocation> {
    return fetch("https://region.turso.io/").then((res) => res.json());
  }
}
