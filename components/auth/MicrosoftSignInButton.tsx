// The four-color Microsoft logo squares, per Microsoft's identity guidelines
// for "Sign in with Microsoft" buttons.
function MicrosoftLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 21 21" aria-hidden="true">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

export function MicrosoftSignInButton() {
  return (
    <a
      href="/api/auth/microsoft/login"
      className="inline-flex min-h-[48px] w-full items-center justify-center gap-3 rounded-full border-[1.5px] border-border-strong bg-white px-6 text-sm font-medium text-ink transition hover:border-indigo hover:text-indigo"
    >
      <MicrosoftLogo />
      Sign in with Microsoft
    </a>
  );
}
