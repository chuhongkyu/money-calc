import "@testing-library/jest-dom/vitest";

// jsdom 에는 ResizeObserver 가 없다. SEED 컴포넌트(scale-feedback 등)가 사용한다.
if (typeof globalThis.ResizeObserver === "undefined") {
  class ResizeObserverStub {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;
}
