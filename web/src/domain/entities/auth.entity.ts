// Pure domain entities for authentication - no framework dependencies

export interface SignUpEntity {
  fullName: string;
  email: string;
  password: string;
}

export interface SignUpResult {
  userId: string;
  verificationToken: string;
}
