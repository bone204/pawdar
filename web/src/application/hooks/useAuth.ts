import {
  useSignUpMutation,
  useVerifyEmailMutation,
  useResendEmailMutation,
  useLoginMutation,
} from "@/infrastructure/rtk/api/auth.api";
import {
  SignUpRequestDto,
  VerifyEmailRequestDto,
  ResendEmailRequestDto,
  LoginRequestDto,
} from "@/application/dto/auth.dto";

export const useAuth = () => {
  const [signUpMutation, { isLoading: isSigningUp, error: signUpError }] = useSignUpMutation();
  const [verifyEmailMutation, { isLoading: isVerifying, error: verifyError }] = useVerifyEmailMutation();
  const [resendEmailMutation, { isLoading: isResending, error: resendError }] = useResendEmailMutation();
  const [loginMutation, { isLoading: isLoggingIn, error: loginError }] = useLoginMutation();

  const signUp = async (data: SignUpRequestDto) => {
    return await signUpMutation(data).unwrap();
  };

  const verifyEmail = async (data: VerifyEmailRequestDto) => {
    return await verifyEmailMutation(data).unwrap();
  };

  const resendEmail = async (data: ResendEmailRequestDto) => {
    return await resendEmailMutation(data).unwrap();
  };

  const login = async (data: LoginRequestDto) => {
    return await loginMutation(data).unwrap();
  };

  return {
    signUp,
    verifyEmail,
    resendEmail,
    login,
    isSigningUp,
    isVerifying,
    isResending,
    isLoggingIn,
    signUpError,
    verifyError,
    resendError,
    loginError,
  };
};
