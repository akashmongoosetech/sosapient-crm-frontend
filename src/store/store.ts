import { configureStore, createSlice } from '@reduxjs/toolkit';

const SIDEBAR_KEY = 'crm.sidebarOpen';

function initialSidebarOpen(): boolean {
  try {
    const raw = localStorage.getItem(SIDEBAR_KEY);
    if (raw === '0') return false;
    if (raw === '1') return true;
  } catch {
    // Private mode / unavailable storage: fall back to expanded.
  }
  return true;
}

const ui = createSlice({
  name: 'ui',
  initialState: { sidebarOpen: initialSidebarOpen(), theme: 'light' as 'light' | 'dark' },
  reducers: {
    toggleSidebar: (s) => {
      s.sidebarOpen = !s.sidebarOpen;
      try {
        // UI preference only — never auth tokens or sensitive data.
        localStorage.setItem(SIDEBAR_KEY, s.sidebarOpen ? '1' : '0');
      } catch {
        // Ignore storage failures.
      }
    },
    setTheme: (s, a) => { s.theme = a.payload; },
  },
});

export const { toggleSidebar, setTheme } = ui.actions;
export const store = configureStore({ reducer: { ui: ui.reducer } });
export type RootState = ReturnType<typeof store.getState>;
