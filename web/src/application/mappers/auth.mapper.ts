// Mappers for authentication: convert between DTOs and Domain Entities

import { SignUpEntity, SignUpResult } from "@/domain/entities/auth.entity";
import { SignUpRequestDto, SignUpResponseDto } from "../dto/auth.dto";

export const authMapper = {
  toSignUpEntity(dto: SignUpRequestDto): SignUpEntity {
    return {
      fullName: dto.fullName,
      email: dto.email,
      password: dto.password,
    };
  },

  toSignUpResult(dto: SignUpResponseDto): SignUpResult {
    return {
      userId: dto.userId,
      verificationToken: dto.verificationToken,
    };
  },
};
