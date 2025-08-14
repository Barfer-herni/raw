'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Facebook, Instagram, Linkedin, Mail, Phone, ShoppingBag, Shield, CheckCircle } from 'lucide-react';
import logo from '@/public/logo.png';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { Dictionary } from '@repo/internationalization';

// Simple data structure for saved food
const defaultFoodData = {
  location: '',
  date: '',
  price: 0,
  originalPrice: 0
};

// Use a fallback if the imported one isn't available yet
let savedFoodData;
try {
  savedFoodData = require('../(home)/components/hero').savedFoodData || defaultFoodData;
} catch (e) {
  savedFoodData = defaultFoodData;
}

type FooterProps = {
  dictionary?: Dictionary;
};

export const Footer = ({ dictionary }: FooterProps) => {
  const params = useParams();
  const locale = params.locale as string;

  // Navigation labels with dictionary fallbacks
  const navLabels = {
    navigation: dictionary?.web.footer?.product.title || "Navegación",
    home: dictionary?.web.header?.home || "Inicio",
    features: dictionary?.web.footer?.product.features || "Características",
    pricing: dictionary?.web.footer?.product.pricing || "Precios",
    about: dictionary?.web.footer?.product.about || "Acerca de",
    contact: dictionary?.web.footer?.product.contact || "Contacto"
  };

  // Features labels with dictionary fallbacks
  const featureLabels = {
    features: dictionary?.web.footer?.product.title || "Características"
  };

  // Contact labels with dictionary fallbacks
  const contactLabels = {
    contact: dictionary?.web.footer?.company.title || "Contacto"
  };

  return (
    <footer className="relative mt-24 border-t border-[#0d4b3d]/10 dark:border-[#0d4b3d]/30 bg-white dark:bg-gray-900 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#0d4b3d]/5 dark:bg-[#0d4b3d]/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-[#0d4b3d]/5 dark:bg-[#0d4b3d]/5 rounded-full blur-2xl"></div>
      </div>

      <div className="container mx-auto px-4">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 py-16">
          {/* Logo and description */}
          <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex gap-2 items-center mb-6"
            >
              <div className="relative flex items-center">
                <Image
                  src={logo}
                  alt="LupaPyme"
                  width={180}
                  height={60}
                  className="h-14 w-auto"
                />
              </div>
            </motion.div>

            <p className="leading-relaxed max-w-sm text-gray-600 dark:text-gray-300">
              {dictionary?.web.footer?.companyDescription || "LupaPyme is the platform that helps you understand your customers and boost your business. In-depth metrics, customer retention, and total control of your company."}
            </p>
            <div className="flex gap-4 mt-6">
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-[#0d4b3d] dark:text-gray-400 dark:hover:text-[#0d4b3d]/90 transition-colors"
              >
                <Facebook />
              </a>
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-[#0d4b3d] dark:text-gray-400 dark:hover:text-[#0d4b3d]/90 transition-colors"
              >
                <Instagram />
              </a>
              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-[#0d4b3d] dark:text-gray-400 dark:hover:text-[#0d4b3d]/90 transition-colors"
              >
                <Linkedin />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2 flex flex-col items-center md:items-start">
            <h3 className="font-semibold mb-4 text-center md:text-left text-gray-800 dark:text-white">
              {navLabels.navigation}
            </h3>
            <ul className="space-y-3 text-center md:text-left">
              <li>
                <Link
                  href={`/${locale}`}
                  className="text-gray-600 dark:text-gray-300 hover:text-[#0d4b3d] dark:hover:text-[#0d4b3d]/90 transition-colors"
                >
                  {navLabels.home}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}#features`}
                  className="text-gray-600 dark:text-gray-300 hover:text-[#0d4b3d] dark:hover:text-[#0d4b3d]/90 transition-colors"
                >
                  {navLabels.features}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/pricing`}
                  className="text-gray-600 dark:text-gray-300 hover:text-[#0d4b3d] dark:hover:text-[#0d4b3d]/90 transition-colors"
                >
                  {navLabels.pricing}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}#faq`}
                  className="text-gray-600 dark:text-gray-300 hover:text-[#0d4b3d] dark:hover:text-[#0d4b3d]/90 transition-colors"
                >
                  {navLabels.about}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/contact`}
                  className="text-gray-600 dark:text-gray-300 hover:text-[#0d4b3d] dark:hover:text-[#0d4b3d]/90 transition-colors"
                >
                  {navLabels.contact}
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div className="md:col-span-3 flex flex-col items-center md:items-start">
            <h3 className="font-semibold mb-4 text-center md:text-left text-gray-800 dark:text-white">
              {featureLabels.features}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 justify-center md:justify-start text-gray-600 dark:text-gray-300">
                <ShoppingBag className="w-4 h-4 text-[#0d4b3d]" />
                <span>{dictionary?.web.footer?.menuCreation || "Creación de Menús Digitales"}</span>
              </li>
              <li className="flex items-center gap-3 justify-center md:justify-start text-gray-600 dark:text-gray-300">
                <Shield className="w-4 h-4 text-[#0d4b3d]" />
                <span>{dictionary?.web.footer?.mobileFirst || "Diseño Mobile-First"}</span>
              </li>
              <li className="flex items-center gap-3 justify-center md:justify-start text-gray-600 dark:text-gray-300">
                <CheckCircle className="w-4 h-4 text-[#0d4b3d]" />
                <span>{dictionary?.web.footer?.analytics || "Análisis e Insights"}</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-3 flex flex-col items-center md:items-start">
            <h3 className="font-semibold mb-4 text-center md:text-left text-gray-800 dark:text-white">
              {contactLabels.contact}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 justify-center md:justify-start">
                <Mail className="w-4 h-4 text-[#0d4b3d]" />
                <a
                  href="mailto:info@lupapyme.com"
                  className="text-gray-600 dark:text-gray-300 hover:text-[#0d4b3d] dark:hover:text-[#0d4b3d]/90 transition-colors"
                >
                  info@lupapyme.com
                </a>
              </li>
              <li className="flex items-center gap-3 justify-center md:justify-start">
                <Phone className="w-4 h-4 text-[#0d4b3d]" />
                <a
                  href="tel:+34900123456"
                  className="text-gray-600 dark:text-gray-300 hover:text-[#0d4b3d] dark:hover:text-[#0d4b3d]/90 transition-colors"
                >
                  +34 900 123 456
                </a>
              </li>
              <li className="mt-4">
                <Link
                  href={`/${locale}/sign-in`}
                  className="bg-[#0d4b3d] hover:bg-[#0d4b3d]/90 text-white px-4 py-2 rounded-lg transition-colors inline-block"
                >
                  {dictionary?.web.footer?.getStarted || "Comenzar"}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* App Stores */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 border-t border-[#0d4b3d]/10 py-8">
        </div>

        {/* Copyright and Legal */}
        <div className="border-t border-[#0d4b3d]/10 py-8 text-center md:flex md:justify-between text-sm text-gray-500 dark:text-gray-400">
          <div>© {new Date().getFullYear()} LupaPyme. {dictionary?.web.footer?.rights || "Todos los derechos reservados"}</div>
          <div className="flex flex-wrap justify-center md:justify-end gap-4 mt-4 md:mt-0">
            <Link
              href={`/${locale}/privacy`}
              className="hover:text-[#0d4b3d] dark:hover:text-[#0d4b3d]/90 transition-colors"
            >
              {dictionary?.web.footer?.legal.privacy || "Política de Privacidad"}
            </Link>
            <Link
              href={`/${locale}/terms`}
              className="hover:text-[#0d4b3d] dark:hover:text-[#0d4b3d]/90 transition-colors"
            >
              {dictionary?.web.footer?.legal.terms || "Términos y Condiciones"}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
