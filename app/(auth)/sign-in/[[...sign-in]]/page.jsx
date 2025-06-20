import { SignIn } from "@clerk/nextjs";
import Header from "@/app/_components/Header";

export default function Page() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Tekrar Hoş Geldin
            </h1>

            <p className="text-gray-600 text-base leading-relaxed">
              Harcama takip yolculuğuna devam etmek için
              <br />
              <span className="font-semibold text-blue-600">
                hesabınla giriş yap
              </span>
            </p>
          </div>

          {/* Sign In Form */}
          <div className="bg-white  rounded-2xl p-8">
            <SignIn
              path="/sign-in"
              routing="path"
              signUpUrl="/sign-up"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-transparent shadow-none border-none p-0",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton:
                    "bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700 transition-all duration-200 rounded-lg font-medium",
                  socialButtonsBlockButtonText: "font-medium",
                  dividerLine: "bg-gray-200",
                  dividerText: "text-gray-500 font-medium",
                  formFieldInput:
                    "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg transition-all duration-200",
                  formButtonPrimary:
                    "bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-all duration-200",
                  footerActionLink:
                    "text-blue-600 hover:text-blue-700 font-semibold",
                  identityPreviewText: "font-medium text-gray-700",
                  identityPreviewEditButton:
                    "text-blue-600 hover:text-blue-700",
                },
              }}
            />
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              Henüz hesabın yok mu?{" "}
              <a
                href="/sign-up"
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200"
              >
                Ücretsiz hesap oluştur
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
