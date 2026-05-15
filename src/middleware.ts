import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware() {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token, req }) {
        const path = req.nextUrl.pathname;
        const role = token?.role;

        if (path.startsWith("/admin")) return role === "ADMIN";
        if (path.startsWith("/farmer")) return role === "FARMER";
        if (path.startsWith("/buyer")) return role === "BUYER";
        if (path.startsWith("/messages") || path.startsWith("/notifications")) return Boolean(token);
        return Boolean(token);
      },
    },
  },
);

export const config = {
  matcher: [
    "/farmer/:path*",
    "/buyer/dashboard/:path*",
    "/buyer/orders/:path*",
    "/buyer/rfq/:path*",
    "/buyer/templates/:path*",
    "/buyer/analytics/:path*",
    "/buyer/invoices/:path*",
    "/buyer/profile/:path*",
    "/buyer/suppliers/:path*",
    "/buyer/cart",
    "/buyer/cart/:path*",
    "/admin/:path*",
    "/messages",
    "/messages/:path*",
    "/notifications",
    "/notifications/:path*",
  ],
};
