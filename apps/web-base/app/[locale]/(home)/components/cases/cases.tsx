'use client';

import type { Dictionary } from '@repo/internationalization';
import { motion } from 'framer-motion';
import { staggerContainer, fadeIn } from '../../lib/animations';
import { useState } from 'react';
import { ProjectModal } from './project-modal';
import Image from 'next/image';

type CasesProps = {
  dictionary: Dictionary;
  projects: CaseStudy[];
};

export type CaseStudy = {
  id: string;
  title: string;
  description: string;
  images: string[];
  status: string;
  size: string;
  status_description: string;
  technologies: string[];
  features: string[];
};

export const Cases = ({ dictionary, projects }: CasesProps) => {
  const [selectedProject, setSelectedProject] = useState<CaseStudy | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const openProjectDetails = (project: CaseStudy) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  return (
    <motion.section
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      variants={staggerContainer}
      className="container mx-auto px-4 py-24 relative"
    >
      {/* Elementos decorativos */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-20 top-1/3 w-64 h-64 bg-[#0d4b3d]/20 rounded-full blur-3xl"></div>
        <div className="absolute right-0 bottom-0 w-96 h-96 bg-[#0d4b3d]/10 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white/30 rounded-full animate-ping"></div>
      </div>

      {/* Encabezado */}
      <motion.div variants={fadeIn} className="text-center mb-16 relative">
        {/* Frase flotante */}
        <span className="absolute -top-8 left-4 md:left-20 text-sm md:text-lg text-white/70 font-normal italic -rotate-12 origin-left">
          &quot;{dictionary.web.home.cases.quote || 'Data is the new oil. LupaPyme helps you refine it.'}&quot;
        </span>

        {/* Título centrado */}
        <h2
          id="projects"
          className="text-3xl md:text-4xl font-bold text-white mb-4"
        >
          {dictionary.web.home.cases.projectsTitle || 'Our Clients\' Results'}
        </h2>
        <div className="w-20 h-1 bg-gradient-to-r from-[#0d4b3d]/70 to-[#0d4b3d] rounded-full mx-auto mb-6"></div>

        <p className="text-white/70 text-sm max-w-2xl mx-auto my-2">
          {dictionary.web.home.cases.subtitle || 'We are proud of the impact we have on our clients\' businesses. Here are some of their stories.'}
        </p>
      </motion.div>

      {/* Grid de proyectos */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Proyecto Principal (Medium) */}
        {projects.map((project, index) =>
          project.size === "medium" ? (
            <motion.div
              key={index}
              variants={{
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5 }}
              className="w-full md:w-1/2 h-fit"
              onClick={() => openProjectDetails(project)}
            >
              <div className="relative cursor-pointer overflow-hidden rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 h-full">
                <div className="aspect-[3/2] relative">
                  {project.images.length > 0 && (
                    <div className="w-full h-full relative">
                      <Image
                        src={project.images[0]}
                        alt={project.title}
                        fill
                        className="object-cover object-center"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10"></div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-2 h-2 rounded-full ${project.status === "finished"
                        ? "bg-green-400 animate-pulse"
                        : "bg-[#0d4b3d] animate-pulse"
                        }`}
                    ></div>
                    <span className="text-xs text-white/70 capitalize">
                      {project.status === "finished"
                        ? dictionary.web.home.cases.projectStatus.finished
                        : dictionary.web.home.cases.projectStatus.inProgress}
                    </span>
                  </div>

                  <h3 className="text-lg md:text-base font-semibold mb-2 text-white">
                    {project.title}
                  </h3>
                  <p className="hidden md:block text-sm text-gray-200">
                    {project.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ) : null
        )}

        {/* Grid de Proyectos Pequeños */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4 w-full md:w-1/2">
          {projects.map((project, index) =>
            project.size !== "medium" ? (
              <motion.div
                key={index}
                variants={{
                  initial: { opacity: 0, y: 20 },
                  animate: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative group h-fit"
                onClick={() => openProjectDetails(project)}
              >
                <div className="relative cursor-pointer overflow-hidden rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 h-full">
                  <div className="aspect-[3/2] relative">
                    {project.images.length > 0 && (
                      <div className="w-full h-full relative">
                        <Image
                          src={project.images[0]}
                          alt={project.title}
                          fill
                          className="object-cover object-center"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10"></div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`w-2 h-2 rounded-full ${project.status === "finished"
                          ? "bg-green-400 animate-pulse"
                          : "bg-[#0d4b3d] animate-pulse"
                          }`}
                      ></div>
                      <span className="text-xs text-white/70 capitalize">
                        {project.status === "finished"
                          ? dictionary.web.home.cases.projectStatus.finished
                          : dictionary.web.home.cases.projectStatus.inProgress}
                      </span>
                    </div>

                    <h3 className="text-lg md:text-base font-semibold mb-2 text-white">
                      {project.title}
                    </h3>
                    <p className="hidden md:block text-sm text-gray-200">
                      {project.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : null
          )}
        </div>
      </div>

      {/* Project Detail Modal */}
      <ProjectModal
        project={selectedProject}
        dictionary={dictionary}
        open={isModalOpen}
        onClose={handleCloseModal}
      />
    </motion.section>
  );
};
