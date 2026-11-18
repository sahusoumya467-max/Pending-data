import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import {
  signInWithGooglePopup,
  signOutGoogle,
  getFreshIdToken,
  getCachedInMemoryToken,
  subscribeAuthState,
  auth,
} from './lib/firebase.ts';
import { BankingScene3D, Branch3DDatum } from './three/BankingScene3D.ts';

declare global {
  interface Window {
    FirebasePortalBridge?: {
      signInGoogle: () => Promise<{
        uid: string;
        email: string;
        displayName: string;
        idToken: string;
      }>;
      signOutGoogle: () => Promise<void>;
      getIdToken: (forceRefresh?: boolean) => Promise<string | null>;
      getCachedToken: () => string | null;
      getCurrentUser: () => {
        uid: string;
        email: string;
        displayName: string;
      } | null;
      onAuthChange: (
        cb: (
          user: { uid: string; email: string; displayName: string } | null
        ) => void
      ) => () => void;
    };
    Credit3DWorkspace?: {
      mount: (
        containerId: string,
        branches?: Branch3DDatum[],
        onSelect?: (b: Branch3DDatum | null) => void,
        onHover?: (b: Branch3DDatum | null) => void,
        onFallback?: (msg: string) => void
      ) => void;
      updateBranches: (branches: Branch3DDatum[]) => void;
      setPreset: (preset: 'overview' | 'vault' | 'topBranch' | 'orbit') => void;
      focusBranch: (branchName: string) => void;
      setTheme: (isDark: boolean) => void;
      setAutoRotate: (enabled: boolean) => void;
      resize: () => void;
      dispose: () => void;
    };
  }
}

let activeScene: BankingScene3D | null = null;

window.FirebasePortalBridge = {
  async signInGoogle() {
    const { user, idToken } = await signInWithGooglePopup();
    return {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      idToken,
    };
  },
  async signOutGoogle() {
    await signOutGoogle();
  },
  async getIdToken(forceRefresh = false) {
    return getFreshIdToken(forceRefresh);
  },
  getCachedToken() {
    return getCachedInMemoryToken();
  },
  getCurrentUser() {
    const u = auth.currentUser;
    if (!u) return null;
    return {
      uid: u.uid,
      email: u.email || '',
      displayName: u.displayName || '',
    };
  },
  onAuthChange(cb) {
    return subscribeAuthState((u) => {
      if (!u) {
        cb(null);
      } else {
        cb({
          uid: u.uid,
          email: u.email || '',
          displayName: u.displayName || '',
        });
      }
    });
  },
};

window.Credit3DWorkspace = {
  mount(containerId, branches = [], onSelect, onHover, onFallback) {
    const el = document.getElementById(containerId);
    if (!el) return;
    if (activeScene) {
      activeScene.dispose();
      activeScene = null;
    }
    activeScene = new BankingScene3D(el, {
      onSelectBranch: onSelect,
      onHoverBranch: onHover,
      onFallback,
    });
    activeScene.setBranchData(branches);
    const isDark = !document.body.classList.contains('light-3d-studio');
    activeScene.setTheme(isDark);
  },
  updateBranches(branches) {
    activeScene?.setBranchData(branches);
  },
  setPreset(preset) {
    activeScene?.setCameraPreset(preset);
  },
  focusBranch(branchName) {
    activeScene?.focusOnBranch(branchName);
  },
  setTheme(isDark) {
    activeScene?.setTheme(isDark);
  },
  setAutoRotate(enabled) {
    activeScene?.setAutoRotate(enabled);
  },
  resize() {
    activeScene?.resize();
  },
  dispose() {
    if (activeScene) {
      activeScene.dispose();
      activeScene = null;
    }
  },
};

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(<App />);
}
