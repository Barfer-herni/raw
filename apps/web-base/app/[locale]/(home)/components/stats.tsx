'use client';

import type { Dictionary } from '@repo/internationalization';
import { motion } from 'framer-motion';
import { staggerContainer, fadeIn } from '../lib/animations';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import logoWithBg from '@/public/logoWithBg.png';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

type StatsProps = {
  dictionary: Dictionary;
};

export const Stats = ({ dictionary }: StatsProps) => {
  const steps = [
    {
      title: dictionary.web.home.stats.process?.[0]?.title || "Conecta tus datos",
      description: dictionary.web.home.stats.process?.[0]?.description || "Conecta tu sistema de ventas o sube tus datos de forma segura."
    },
    {
      title: dictionary.web.home.stats.process?.[1]?.title || "Analiza tus métricas",
      description: dictionary.web.home.stats.process?.[1]?.description || "Visualiza tus KPIs más importantes en un dashboard intuitivo."
    },
    {
      title: dictionary.web.home.stats.process?.[2]?.title || "Segmenta tus clientes",
      description: dictionary.web.home.stats.process?.[2]?.description || "Clasifica a tus clientes y entiende su comportamiento de compra."
    },
    {
      title: dictionary.web.home.stats.process?.[3]?.title || "Toma acción",
      description: dictionary.web.home.stats.process?.[3]?.description || "Usa la información para crear campañas de marketing y fidelización."
    }
  ];

  return (
    <motion.section
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      variants={staggerContainer}
      className="container mx-auto px-4 py-16 relative"
      id="app"
    >
      {/* Decorative elements */}
      <div className="absolute right-0 bottom-0 w-64 h-64 bg-[#0d4b3d]/10 dark:bg-[#0d4b3d]/5 rounded-full blur-3xl"></div>
      <div className="absolute left-1/4 top-1/2 w-1 h-1 bg-[#0d4b3d]/40 dark:bg-[#0d4b3d]/20 rounded-full"></div>

      {/* Header */}
      <motion.div
        variants={fadeIn}
        className="text-center mb-16"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4 var(--font-nunito)">
          {dictionary.web.home.stats.title || "Cómo funciona LupaPyme"}
        </h2>
        <div className="w-20 h-1 bg-gradient-to-r from-[#0d4b3d]/70 to-[#0d4b3d] rounded-full mx-auto mb-6"></div>
        <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto var(--font-nunito)">
          {dictionary.web.home.stats.description || "Sigue estos sencillos pasos para empezar a entender a tus clientes y potenciar tu negocio."}
        </p>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            variants={{
              initial: { opacity: 0, y: 50 },
              animate: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            className="flex flex-col items-center text-center"
          >
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-[#0d4b3d]/10 dark:bg-[#0d4b3d]/20 rounded-full flex items-center justify-center">
                <span className="text-4xl font-bold text-[#0d4b3d] dark:text-white">
                  {index + 1}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 left-full w-full h-px bg-[#0d4b3d]/20 dark:bg-[#0d4b3d]/30 -translate-y-1/2"></div>
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3 var(--font-nunito)">
              {step.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 var(--font-nunito) max-w-xs mx-auto">
              {step.description}
            </p>
          </motion.div>
        ))}
      </div>

      {/* App Preview Image with animation */}
      <motion.div
        variants={fadeIn}
        className="mt-20 flex justify-center"
      >
        <motion.div
          className="relative max-w-sm lg:max-w-2xl"
          animate={{
            y: [0, -10, 0],
            transition: {
              y: { repeat: Infinity, duration: 3, ease: "easeInOut" },
            }
          }}
        >
          <Image
            src={logoWithBg}
            alt="LupaPyme App"
            width={600}
            height={400}
            className="rounded-lg shadow-xl"
          />
        </motion.div>
      </motion.div>
    </motion.section>
  );
};
