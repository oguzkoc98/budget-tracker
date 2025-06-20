import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Korunmayacak (public) route'ları tanımla
const isPublicRoute = createRouteMatcher([
  "/", // Anasayfa
  "/sign-in(.*)", // Giriş sayfası ve alt route'ları
  "/sign-up(.*)", // Kayıt sayfası ve alt route'ları
]);

export default clerkMiddleware(async (auth, req) => {
  // Eğer route public değilse, kullanıcının giriş yapmış olmasını zorunlu kıl
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
