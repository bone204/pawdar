// Sign-up use case - single responsibility: orchestrate the sign-up flow

import { IAuthRepository } from "../repositories/auth.repository.interface";
import { SignUpEntity, SignUpResult } from "../entities/auth.entity";

export class SignUpUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(data: SignUpEntity): Promise<SignUpResult> {
    return this.authRepository.signUp(data);
  }
}
