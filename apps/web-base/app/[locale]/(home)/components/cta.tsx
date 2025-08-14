'use client';

import type { Dictionary } from '@repo/internationalization';
import { motion } from 'framer-motion';
import { fadeIn } from '../lib/animations';
import { ShoppingBag, ArrowRight, Smartphone, Utensils, MapPin } from 'lucide-react';
import Link from 'next/link';

type CTAProps = {
  dictionary: Dictionary;
  locale?: string;
};

export const CTA = ({ dictionary, locale = 'es' }: CTAProps) => {
  // Create WhatsApp message for LupaPyme
  const getWhatsAppMessage = () => {
    return "¡Hola! Quiero saber más sobre cómo LupaPyme puede ayudar a mi negocio a crecer con métricas y retención de clientes.";
  };

  return (
    <div className="w-full py-20 lg:py-32 bg-[#0d4b3d] dark:bg-[#0d4b3d]/80" id="business">
      <div className="container mx-auto">
        <motion.div
          variants={fadeIn}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-12"
          id="contact"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {dictionary.web.home.cta.heading || "¿Tenés un negocio?"}
          </h2>
          <div className="w-20 h-1 bg-white rounded-full mx-auto mb-6"></div>
          <p className="text-lg text-white/90">
            {dictionary.web.home.cta.paragraph || "Usa LupaPyme para convertir tus datos en ganancias y ayudar a crecer tu negocio."}
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          {/* Join as business button */}
          <motion.div
            variants={{
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
            }}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-[#0d4b3d]/20 dark:bg-[#0d4b3d]/50 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8 text-[#0d4b3d] dark:text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                    {dictionary.web.global.primaryCta || "Comienza a potenciar tu negocio"}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">Proceso 100% digital y adaptable.</p>
                </div>
              </div>

              <p className="mb-8 text-gray-600 dark:text-gray-300">Conecta tus datos en nuestra plataforma y comienza a tomar decisiones estratégicas. Atrae más clientes y mejora la rentabilidad de tu negocio.</p>

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0d4b3d]/20 dark:bg-[#0d4b3d]/50 flex items-center justify-center text-[#0d4b3d] dark:text-white font-bold">1</div>
                  <p className="flex-1 text-gray-800 dark:text-gray-200">Conecta tus fuentes de datos</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0d4b3d]/20 dark:bg-[#0d4b3d]/50 flex items-center justify-center text-[#0d4b3d] dark:text-white font-bold">2</div>
                  <p className="flex-1 text-gray-800 dark:text-gray-200">Analiza tus métricas clave</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0d4b3d]/20 dark:bg-[#0d4b3d]/50 flex items-center justify-center text-[#0d4b3d] dark:text-white font-bold">3</div>
                  <p className="flex-1 text-gray-800 dark:text-gray-200">Toma decisiones informadas para crecer</p>
                </div>
              </div>

              <Link
                href={`/${locale}/contact`}
                className="w-full mt-8 bg-[#0d4b3d] hover:bg-[#0d4b3d]/90 text-white flex items-center justify-center gap-2 py-4 rounded-lg font-medium transition-all shadow-lg text-center"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>{dictionary.web.global.primaryCta || "Contactanos"}</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
