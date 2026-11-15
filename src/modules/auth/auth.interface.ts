import type { PublicUser } from "../user/user.interface.js";

export type AuthResult = {
  user: PublicUser;
  token: string;
};