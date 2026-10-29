export function safeReturnPath(value: string | null): string {
  return value && /^\/(?!\/)[^\u0000-\u0020\\]*$/.test(value) ? value : "/";
}
