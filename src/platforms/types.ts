export type AppRuntime = "web" | "ios" | "android" | "native" | "unknown";

export type DeviceType =
  | "phone"
  | "tablet"
  | "desktop"
  | "tv"
  | "wearable"
  | "unknown";

export interface PlatformDetails {
  runtime: AppRuntime;
  device?: {
    type?: DeviceType;
  };
  browser?: {
    name?: string;
    version?: string;
    engine?: string;
    userAgent?: string;
  };
  raw?: unknown;
}
