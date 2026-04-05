import { type NextRequest, NextResponse } from "next/server";
import { isAuthConfigured } from "@/lib/auth/config";
import { getSessionFromRequest } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const configured = isAuthConfigured();
  if (!configured) {
    return NextResponse.json({
      authRequired: false,
      authenticated: true,
      user: null,
    });
  }

  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({
      authRequired: true,
      authenticated: false,
      user: null,
    });
  }

  return NextResponse.json({
    authRequired: true,
    authenticated: true,
    user: {
      id: session.sub,
      email: session.email,
      role: session.role,
    },
  });
}
