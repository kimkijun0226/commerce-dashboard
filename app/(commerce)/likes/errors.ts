export class AuthRequiredError extends Error {
  name = "AuthRequiredError";

  constructor(message = "로그인이 필요합니다.") {
    super(message);
  }
}

