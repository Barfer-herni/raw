'use client';

import { type CaseStudy } from './cases';
import type { Dictionary } from '@repo/internationalization';
import Image from 'next/image';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@repo/design-system/components/ui/dialog';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@repo/design-system/components/ui/carousel';

type ProjectModalProps = {
    project: CaseStudy | null;
    dictionary: Dictionary;
    onClose: () => void;
    open: boolean;
};

export const ProjectModal = ({ project, dictionary, onClose, open }: ProjectModalProps) => {
    if (!project) return null;

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">{project.title}</DialogTitle>
                    <div className="flex items-center gap-2 mt-1">
                        <div
                            className={`w-2 h-2 rounded-full ${project.status === "finished"
                                ? "bg-success animate-pulse"
                                : "bg-[#0d4b3d] animate-pulse"
                                }`}
                        ></div>
                        <DialogDescription>
                            <span className="text-xs text-muted-foreground capitalize">
                                {project.status === "finished"
                                    ? dictionary.web.home.cases.projectStatus.finished
                                    : dictionary.web.home.cases.projectStatus.inProgress}
                            </span>
                        </DialogDescription>
                    </div>
                </DialogHeader>

                {/* Project Images Carousel */}
                <div className="aspect-video w-full mb-6">
                    <Carousel className="w-full">
                        <CarouselContent>
                            {project.images.map((image, index) => (
                                <CarouselItem key={index}>
                                    <div className="aspect-video relative">
                                        <Image
                                            src={image}
                                            alt={`${project.title} - Image ${index + 1}`}
                                            className="object-contain"
                                            width={800}
                                            height={450}
                                            priority={index === 0}
                                        />
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="left-2" />
                        <CarouselNext className="right-2" />
                    </Carousel>
                </div>

                {/* Project Description */}
                <div className="space-y-4">
                    <div>
                        <h3 className="text-base font-medium mb-2">{dictionary.web.home.cases.modal.description || 'Description'}</h3>
                        <p className="text-muted-foreground">{project.description}</p>
                        {project.status_description && (
                            <p className="text-muted-foreground mt-2">{project.status_description}</p>
                        )}
                    </div>

                    {/* Technologies */}
                    <div>
                        <h3 className="text-base font-medium mb-2">{dictionary.web.home.cases.modal.technologies || 'Technologies'}</h3>
                        <div className="flex flex-wrap gap-2">
                            {project.technologies.map((tech, index) => (
                                <span
                                    key={index}
                                    className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs"
                                >
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Features */}
                    <div>
                        <h3 className="text-base font-medium mb-2">{dictionary.web.home.cases.modal.features || 'Features'}</h3>
                        <ul className="list-disc pl-5 space-y-1">
                            {project.features.map((feature, index) => (
                                <li key={index} className="text-muted-foreground">
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}; 