import { Inter } from "next/font/google";
import "./globals.css";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Cebimden",
  description: "Harcama Takip Uygulaması",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#1e40af",
        },
        elements: {
          userButtonPopoverCard: {
            zIndex: 9999,
          },
          userButtonPopover: {
            zIndex: 9999,
          },
        },
      }}
    >
      <html lang="tr">
        <head>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, user-scalable=no"
          />
        </head>
        <body className={`${inter.variable} antialiased font-sans`}>
          <Toaster />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
