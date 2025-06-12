import { isAuthenticated } from "../stores/user";

export async function authGuard(): Promise<boolean> {
  return await isAuthenticated();
}
