import '@testing-library/jest-dom/vitest';

// jsdom does not implement object URLs; stub for upload-preview components.
if (typeof URL.createObjectURL !== 'function') {
  let counter = 0;
  URL.createObjectURL = (() => `blob:mock-${++counter}`) as typeof URL.createObjectURL;
}
if (typeof URL.revokeObjectURL !== 'function') {
  URL.revokeObjectURL = (() => {}) as typeof URL.revokeObjectURL;
}
