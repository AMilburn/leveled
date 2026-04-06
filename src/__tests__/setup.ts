// Stub browser globals missing in the node test environment
if (typeof window === "undefined") {
  (global as any).window = {
    addEventListener: () => {},
    removeEventListener: () => {},
  };
}
