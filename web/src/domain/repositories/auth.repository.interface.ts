// Repository interface for authentication - domain layer contract

import { SignUpEntity, SignUpResult } from "../entities/auth.entity";

export interface IAuthRepository {
  signUp(data: SignUpEntity): Promise<SignUpResult>;
}
