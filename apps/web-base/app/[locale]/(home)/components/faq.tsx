'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@repo/design-system/components/ui/accordion';
import { Button } from '@repo/design-system/components/ui/button';
import type { Dictionary } from '@repo/internationalization';
import { MessageCircle, HelpCircle, BarChart3, Lightbulb, Heart } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { fadeIn } from '../lib/animations';

type FAQProps = {
  dictionary: Dictionary;
  locale: string;
};

// Sample FAQ items to use if dictionary doesn't have them
const sampleFaqItems = [
  {
    question: "¿Qué es LupaPyme?",
    answer: "LupaPyme es una plataforma que ayuda a las pymes a analizar sus datos de negocio para tomar mejores decisiones y potenciar su crecimiento."
  },
  {
    question: "¿Qué tipo de negocios pueden usar LupaPyme?",
    answer: "Cualquier pyme que quiera tomar decisiones basadas en datos. Desde tiendas de retail, restaurantes, hasta negocios de servicios."
  },
  {
    question: "¿Es difícil de usar?",
    answer: "Para nada. Nuestra plataforma está diseñada para ser intuitiva y fácil de usar, sin necesidad de conocimientos técnicos."
  },
  {
    question: "¿Mis datos están seguros?",
    answer: "Sí, la seguridad de tus datos es nuestra máxima prioridad. Usamos encriptación y los más altos estándares de seguridad."
  },
  {
    question: "¿Cuánto cuesta usar LupaPyme?",
    answer: "Tenemos planes para todo tipo de negocios, incluyendo un plan gratuito para empezar. Puedes ver todos los detalles en nuestra página de precios."
  },
  {
    question: "¿Necesito instalar algo?",
    answer: "No, LupaPyme es una plataforma 100% online. Solo necesitas una conexión a internet para acceder a tus dashboards."
  }
];

type FaqItem = {
  question: string;
  answer: string;
};

export const FAQ = ({ dictionary, locale }: FAQProps) => {
  // Create WhatsApp message
  const getWhatsAppMessage = () => {
    return "¡Hola! Tengo preguntas sobre LupaPyme. Me interesa saber más sobre cómo funciona y cómo puede ayudar a mi negocio.";
  };

  // Get FAQ items from dictionary if available, otherwise use samples
  const faqItems: FaqItem[] =
    dictionary.web.home.faq?.questions?.map((q: FaqItem) => ({
      question: q.question,
      answer: q.answer,
    })) ?? sampleFaqItems;

  return (
    <div className="w-full py-20 lg:py-40" id="faq">
      <div className="container mx-auto">
        <motion.div
          variants={fadeIn}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800 dark:text-white">
            {dictionary.web.home.faq?.title || 'Preguntas frecuentes'}
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-[#0d4b3d]/70 to-[#0d4b3d] rounded-full mx-auto mb-4"></div>
          <p className="text-base text-gray-600 dark:text-gray-300">
            {dictionary.web.home.faq?.description ||
              'Respuestas a las dudas más comunes sobre LupaPyme y cómo puede ayudar a tu negocio.'}
          </p>
        </motion.div>

        <div className="grid gap-10 lg:grid-cols-2">
          <motion.div
            variants={fadeIn}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="flex flex-col gap-6 items-center lg:items-start"
          >
            <div className="w-16 h-16 bg-[#0d4b3d]/10 dark:bg-[#0d4b3d]/30 rounded-xl flex items-center justify-center mb-2">
              <HelpCircle className="w-8 h-8 text-[#0d4b3d] dark:text-white" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">
              {dictionary.web.home.faq?.contact?.title || '¿Necesitas más información?'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-center lg:text-left mb-4">
              {dictionary.web.home.faq?.contact?.description ||
                'Contáctanos si tienes dudas sobre cómo usar LupaPyme o quieres saber más sobre cómo potenciar tu negocio.'}
            </p>
            <Button
              className="gap-2 bg-[#0d4b3d] hover:bg-[#0d4b3d]/80 text-white shadow-md"
              asChild
            >
              <Link href={`/${locale}/contact`}>
                {dictionary.web.home.faq?.contact?.cta || 'Contáctanos'}{' '}
                <MessageCircle className="h-4 w-4" />
              </Link>
            </Button>

            <div className="flex gap-6 mt-8 justify-center lg:justify-start">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-[#0d4b3d]/10 dark:bg-[#0d4b3d]/30 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-[#0d4b3d] dark:text-white" />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-300">Data-driven</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-[#0d4b3d]/10 dark:bg-[#0d4b3d]/30 rounded-full flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-[#0d4b3d] dark:text-white" />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-300">Insights</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-[#0d4b3d]/10 dark:bg-[#0d4b3d]/30 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-[#0d4b3d] dark:text-white" />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-300">Fidelización</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={fadeIn}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="flex flex-col gap-4"
          >
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item: FaqItem, index: number) => (
                <AccordionItem
                  key={index}
                  value={`index-${index}`}
                  className="mb-3 border border-[#0d4b3d]/20 dark:border-[#0d4b3d]/40 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm"
                >
                  <AccordionTrigger className="px-4 py-3 hover:no-underline font-medium text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
