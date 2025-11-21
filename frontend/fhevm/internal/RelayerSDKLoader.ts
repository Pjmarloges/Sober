import { SDK_CDN_URL, SDK_LOCAL_URL } from "./constants";
import type { FhevmRelayerSDKType, FhevmWindowType } from "../fhevmTypes";

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Relayer SDK can only be loaded in browser"));
      return;
    }
    const existing = document.querySelector(`script[data-relayer-sdk="${src}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)));
    // If it's already marked as loaded, resolve immediately
    const isLoaded = (existing as HTMLElement).getAttribute("data-loaded") === "true";
    if (isLoaded) {
      resolve();
    }
      return;
    }
    const script = document.createElement("script");
    script.async = true;
    script.src = src;
    script.type = "text/javascript";
    script.setAttribute("data-relayer-sdk", src);
  script.onload = () => {
    script.setAttribute("data-loaded", "true");
    resolve();
  };
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

let __loadingPromise: Promise<FhevmRelayerSDKType> | undefined;

export async function loadRelayerSDK(): Promise<FhevmRelayerSDKType> {
  if (typeof window === "undefined") {
    throw new Error("Relayer SDK can only be loaded in browser");
  }
  const w = window as unknown as FhevmWindowType & { RelayerSDKBundle?: FhevmRelayerSDKType };
  if (w.relayerSDK) return w.relayerSDK;
  if (__loadingPromise) return __loadingPromise;

  __loadingPromise = (async () => {
    // 为避免 COEP/CORP 导致的跨域脚本拦截，优先加载本地 UMD 备份，其次再尝试 CDN
    try {
      await loadScript(SDK_LOCAL_URL);
    } catch {
      await loadScript(SDK_CDN_URL);
    }
    const sdk = (w.RelayerSDKBundle ?? (w as any).RelayerSDKBundle) as FhevmRelayerSDKType | undefined;
    if (!sdk) {
      throw new Error("RelayerSDKBundle is not available on window after loading script");
    }
    w.relayerSDK = sdk;
    return sdk;
  })();

  return __loadingPromise;
}



