"use client";
import React from "react";
import {
  ArrowRight,
  PieChart,
  TrendingUp,
  Shield,
  BarChart3,
  Wallet,
  Target,
} from "lucide-react";
import Link from "next/link";

function Hero() {
  const features = [
    {
      icon: <Wallet className="w-8 h-8 text-blue-600" />,
      title: "Bütçe Yönetimi",
      description: "Farklı kategorilerde bütçeler oluşturun ve takip edin",
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-green-600" />,
      title: "Harcama Takibi",
      description: "Günlük harcamalarınızı kaydedin ve analiz edin",
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-purple-600" />,
      title: "Görsel Analiz",
      description: "Grafikler ile harcama trendlerinizi görüntüleyin",
    },
    {
      icon: <Target className="w-8 h-8 text-orange-600" />,
      title: "Hedef Takibi",
      description: "Bütçe hedeflerinize ne kadar yakın olduğunuzu görün",
    },
  ];

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-6">
            <PieChart className="w-4 h-4 mr-2" />
            Portfolio Projesi
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Akıllı <span className="text-blue-600">Bütçe Takip Uygulaması</span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Next.js, Drizzle ORM ve Clerk Auth kullanılarak geliştirilmiş modern
            bir bütçe takip uygulaması. Gelir ve giderlerinizi takip edin,
            harcama trendlerinizi analiz edin.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-in">
              <button className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors flex items-center">
                Demo'yu Deneyin
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </Link>
            <a
              href="https://github.com/oguzkoc98/budget-tracker"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900 px-8 py-3 text-lg font-medium transition-colors"
            >
              GitHub'da Görüntüle
            </a>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6 bg-gray-50 rounded-xl">
              <div className="flex justify-center mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Tech Stack */}
        <div className="text-center bg-gray-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Kullanılan Teknolojiler
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Frontend */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center justify-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                Frontend
              </h3>
              <div className="space-y-2">
                {["Next.js", "React", "Tailwind CSS", "Shadcn UI"].map(
                  (tech, index) => (
                    <span
                      key={index}
                      className="inline-block w-full bg-white px-4 py-2 rounded-lg text-gray-700 font-medium border border-gray-200 hover:border-blue-300 transition-colors"
                    >
                      {tech}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Backend & Database */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center justify-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                Backend & Database
              </h3>
              <div className="space-y-2">
                {["Drizzle ORM", "PostgreSQL", "Clerk Auth"].map(
                  (tech, index) => (
                    <span
                      key={index}
                      className="inline-block w-full bg-white px-4 py-2 rounded-lg text-gray-700 font-medium border border-gray-200 hover:border-green-300 transition-colors"
                    >
                      {tech}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
