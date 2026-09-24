import { clearFlowboardSession } from "../../utils/auth";
export default defineEventHandler((event) => {
  clearFlowboardSession(event);
  return { ok: true };
});
