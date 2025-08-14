'use client';

import type { Dictionary } from '@repo/internationalization';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { BarChart3, Users, Smartphone } from 'lucide-react';
import { useParams } from 'next/navigation';
import { env } from '@/env';
import logo from '@/public/logo.png';
import { staggerContainer, fadeIn, slideIn } from '../lib/animations';
import pedidosPorDia from '@/public/pedidos-por-dia.png';
import piePorCategorias from '@/public/pie-por-categorias.png';
import tablaIngresos from '@/public/tabla-ingresos.png';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

type HeroProps = {
  dictionary: Dictionary;
};

export const Hero = ({ dictionary }: HeroProps) => {
  const params = useParams();
  const locale = params.locale as string;

  return (
    <motion.section
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="min-h-[calc(100vh-4rem)] flex items-center relative px-4 overflow-hidden"
      id="inicio"
    >

      {/* Decorative elements */}
      <div className="absolute -top-10 right-1/4 w-20 h-20 bg-[#0d4b3d]/20 dark:bg-[#0d4b3d]/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-10 left-1/3 w-32 h-32 bg-[#0d4b3d]/10 dark:bg-[#0d4b3d]/5 rounded-full blur-2xl"></div>

      <div className="container mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <motion.div variants={slideIn} className="pt-8 md:pt-0 text-center md:text-left">
            <motion.h1
              className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-6"
              variants={fadeIn}
            >
              {dictionary.web.home.hero.heading || "Understand your clients, grow your business"}
            </motion.h1>
            <motion.p className="text-gray-600 dark:text-gray-300 text-lg mb-8" variants={fadeIn}>
              {dictionary.web.home.hero.paragraph || "LupaPyme gives you the necessary tools to analyze your business metrics, understand your clients' behavior and make strategic decisions to increase retention and sales."}
            </motion.p>
            <div className="flex justify-center md:justify-start gap-4">
              <Link href={`${env.NEXT_PUBLIC_APP_URL}/${locale}/sign-up`}>
                <motion.button
                  className="bg-[#0d4b3d] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#0d4b3d]/90 transition-all shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {dictionary.web.home.hero.primaryCta || "Get started now"}
                </motion.button>
              </Link>
              <Link href="#features">
                <motion.button
                  className="border-2 border-[#0d4b3d] text-[#0d4b3d] px-8 py-3 rounded-lg font-medium hover:bg-[#0d4b3d] hover:text-white transition-all shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {dictionary.web.home.hero.secondaryCta || "Learn more"}
                </motion.button>
              </Link>
            </div>
          </motion.div>
          <motion.div
            className="hidden md:flex justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: { duration: 0.6, delay: 0.2 }
            }}
          >
            <div className="relative w-full max-w-2xl h-[550px]">
              <motion.div
                initial={{ opacity: 0, x: -50, rotate: -15 }}
                animate={{ opacity: 1, x: 0, rotate: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                className="absolute top-5 left-5 w-80 h-auto bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-4 flex flex-col justify-center items-center transform -rotate-12 z-10"
              >
                <Image src={pedidosPorDia} alt={dictionary.web.home.features.featureOne.title || "Advanced Analytics"} className="w-full h-auto object-contain mb-2 rounded-md" />
                <h3 className="text-lg font-bold text-center text-gray-800 dark:text-white">{dictionary.web.home.features.featureOne.title || "Advanced Analytics"}</h3>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 50, rotate: 15 }}
                animate={{ opacity: 1, x: 0, rotate: 0 }}
                transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                className="absolute bottom-5 left-20 w-96 h-auto bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-4 flex flex-col justify-center items-center transform rotate-6 z-20"
              >
                <Image src={piePorCategorias} alt={dictionary.web.home.features.featureTwo.title || "Client Segmentation"} className="w-full h-auto object-contain mb-2 rounded-md" />
                <h3 className="text-lg font-bold text-center text-gray-800 dark:text-white">{dictionary.web.home.features.featureTwo.title || "Client Segmentation"}</h3>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
                className="absolute top-10 right-5 w-80 h-auto bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-4 flex flex-col justify-center items-center transform rotate-12 z-10"
              >
                <Image src={tablaIngresos} alt={dictionary.web.home.features.featureThree.title || "Direct Communication"} className="w-full h-auto object-contain mb-2 rounded-md" />
                <h3 className="text-lg font-bold text-center text-gray-800 dark:text-white">{dictionary.web.home.features.featureThree.title || "Direct Communication"}</h3>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

