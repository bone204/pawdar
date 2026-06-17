// Auth repository implementation using RTK Query mutation

import { IAuthRepository } from "@/domain/repositories/auth.repository.interface";
import { SignUpEntity, SignUpResult } from "@/domain/entities/auth.entity";
import { authMapper } from "@/application/mappers/auth.mapper";
import { authApi } from "@/infrastructure/rtk/api/auth.api";
import { store } from "@/infrastructure/rtk/store";

export class RtkAuthRepository implements IAuthRepository {
  async signUp(data: SignUpEntity): Promise<SignUpResult> {
    const dto = authMapper.toSignUpEntity(data);
    const result = await store.dispatch(
      authApi.endpoints.signUp.initiate(dto)
    );

    if ("error" in result) {
      const err = result.error as { code: string; message: string };
      throw new Error(err.code ?? "signup_failed");
    }

    return authMapper.toSignUpResult(result.data!);
  }
}
