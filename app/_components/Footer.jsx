"use client";
import React from "react";
import { Github, Linkedin, Mail, Phone, MapPin, Heart } from "lucide-react";

function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Kişisel Bilgiler */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">Oğuz Koç</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Frontend Developer & UI/UX Designer
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-gray-300 text-sm">
                <MapPin className="w-4 h-4 mr-2 text-blue-400" />
                İstanbul, Türkiye
              </div>
              <div className="flex items-center text-gray-300 text-sm">
                <Mail className="w-4 h-4 mr-2 text-blue-400" />
                oguzkoc98@gmail.com
              </div>
              <div className="flex items-center text-gray-300 text-sm">
                <Phone className="w-4 h-4 mr-2 text-blue-400" />
                +90 507 834 1040
              </div>
            </div>
          </div>

          {/* Proje Hakkında */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">
              Proje Hakkında
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Bu proje, modern web teknolojileri kullanılarak geliştirilmiş bir
              bütçe takip uygulamasıdır. Next.js, React ve diğer güncel
              teknolojilerle oluşturulmuştur.
            </p>
            <div className="space-y-2">
              <div className="text-gray-300 text-sm">
                <span className="text-blue-400 font-medium">Frontend:</span>{" "}
                Next.js, React, Tailwind CSS
              </div>
              <div className="text-gray-300 text-sm">
                <span className="text-blue-400 font-medium">Backend:</span>{" "}
                Drizzle ORM, Clerk Auth
              </div>
              <div className="text-gray-300 text-sm">
                <span className="text-blue-400 font-medium">Database:</span>{" "}
                PostgreSQL
              </div>
            </div>
          </div>

          {/* Sosyal Medya ve İletişim */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">Bağlantılar</h3>
            <div className="space-y-3">
              <a
                href="https://www.linkedin.com/in/oguzkoc98/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-gray-300 hover:text-blue-400 transition-colors duration-200 group"
              >
                <Linkedin className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-sm">LinkedIn</span>
              </a>
              <a
                href="https://github.com/oguzkoc98"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-gray-300 hover:text-blue-400 transition-colors duration-200 group"
              >
                <Github className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-sm">GitHub</span>
              </a>
              <a
                href="[GitHub repo linki]"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-gray-300 hover:text-blue-400 transition-colors duration-200 group"
              >
                <Github className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-sm">Proje Kaynak Kodu</span>
              </a>
              <a
                href="mailto:oguzkoc98@gmail.com"
                className="flex items-center text-gray-300 hover:text-blue-400 transition-colors duration-200 group"
              >
                <Mail className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-sm">E-posta Gönder</span>
              </a>
            </div>
          </div>
        </div>

        {/* Alt Çizgi ve Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">2025</div>
            <div className="flex items-center text-gray-400 text-sm"></div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
