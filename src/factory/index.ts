/**
 * Public surface da fábrica — importe daqui no código do produto / Lovable.
 *
 *   import { requireAccess, analytics, factoryConfig } from "@/factory"
 */
export { factoryConfig, isPaywalledPath, planFeatures } from "./config";
export {
  getAccess,
  getEntitlement,
  resolveAccess,
  hasFeature,
  startTrial,
  activatePaid,
  type AccessSnapshot,
  type AccessStatus,
} from "./billing";
export { analytics, track } from "./analytics";
export { getSessionAccess, requireAccess } from "./access";
export { provisionFromQuack } from "./provision";
export { RequireAccess } from "./RequireAccess";
export { PaywallScreen } from "./PaywallScreen";
export { useAccess, trackClient } from "./useAccess";
