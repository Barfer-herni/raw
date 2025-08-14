'use client';

import type { Dictionary } from '@repo/internationalization';
import { Smartphone, BarChart3, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, fadeIn } from '../lib/animations';

type FeaturesProps = {
  dictionary: Dictionary;
};

export const Features = ({ dictionary }: FeaturesProps) => {
  const features = [
    {
      icon: <BarChart3 className="w-6 h-6 text-[#0d4b3d] dark:text-white" />,
      title: dictionary.web.home.features.featureOne.title,
      description: dictionary.web.home.features.featureOne.paragraph
    },
    {
      icon: <Users className="w-6 h-6 text-[#0d4b3d] dark:text-white" />,
      title: dictionary.web.home.features.featureTwo.title,
      description: dictionary.web.home.features.featureTwo.paragraph
    },
    {
      icon: <Smartphone className="w-6 h-6 text-[#0d4b3d] dark:text-white" />,
      title: dictionary.web.home.features.featureThree.title,
      description: dictionary.web.home.features.featureThree.paragraph
    }
  ];

  return (
    <motion.section
      id="features"
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      variants={staggerContainer}
      className="w-full py-20 lg:py-40 relative bg-[#0d4b3d]/5 dark:bg-[#0d4b3d]/10"
    >
      <div className="container mx-auto px-4">
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -left-10 top-1/2 w-40 h-40 bg-[#0d4b3d]/20 dark:bg-[#0d4b3d]/10 rounded-full blur-2xl"></div>
          <div className="absolute right-20 bottom-1/4 w-32 h-32 bg-[#0d4b3d]/10 dark:bg-[#0d4b3d]/5 rounded-full blur-xl"></div>
          <div className="absolute top-1/3 left-1/4 w-1 h-1 bg-[#0d4b3d]/40 dark:bg-[#0d4b3d]/20 rounded-full"></div>
          <div className="absolute bottom-1/4 right-1/3 w-2 h-2 bg-[#0d4b3d]/20 dark:bg-[#0d4b3d]/10 rounded-full"></div>
        </div>

        {/* Header */}
        <motion.div variants={fadeIn} className="text-center mb-16 relative">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4 var(--font-nunito)">
            {dictionary.web.home.features.title || "Why Choose LupaPyme"}
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-[#0d4b3d]/70 to-[#0d4b3d] rounded-full mx-auto mb-6"></div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto var(--font-nunito)">
            {dictionary.web.home.features.paragraph || "From detailed analytics to communication tools, LupaPyme has everything you need to take your business to the next level."}
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={{
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-[#0d4b3d]/20 dark:border-[#0d4b3d]/30 hover:border-[#0d4b3d]/40 dark:hover:border-[#0d4b3d]/50 transition-all hover:shadow-xl transform hover:scale-105 shadow-lg"
              whileHover={{
                scale: 1.08,
                transition: { duration: 0.3 }
              }}
            >
              <div className="w-12 h-12 bg-[#0d4b3d]/10 dark:bg-[#0d4b3d]/20 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 transition-transform var(--font-nunito)">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 transition-colors var(--font-nunito)">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};
