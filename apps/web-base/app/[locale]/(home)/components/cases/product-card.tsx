'use client';

import Image from 'next/image';
import type { Dictionary } from '@repo/internationalization';
import { MouseEvent } from 'react';
import type { CaseStudy } from './cases';

export type ProjectCardProps = {
    project: CaseStudy;
    dictionary: Dictionary;
    size: string;
    onClick: (project: CaseStudy) => void;
};

export const ProductCard = ({ project, dictionary, size, onClick }: ProjectCardProps) => {
    // Determine aspect ratio based on size
    const aspectRatioClass = {
        large: 'aspect-[2/1]',
        medium: 'aspect-[3/2]',
        small: 'aspect-[4/3]',
    }[size] || 'aspect-square';

    const handleClick = () => {
        onClick(project);
    };

    // Use the first image if available, otherwise use a placeholder
    const imageUrl = project.images?.[0] || null;

    return (
        <div
            className="relative overflow-hidden rounded-xl bg-card/50 backdrop-blur-sm border border-border hover:border-border/80 transition-all duration-300 h-full cursor-pointer"
            onClick={handleClick}
        >
            <div className={`relative ${aspectRatioClass}`}>
                <div className="h-full w-full">
                    {imageUrl && (
                        <Image
                            src={imageUrl}
                            alt={project.title}
                            className="object-cover w-full h-full"
                            width={800}
                            height={600}
                            priority
                        />
                    )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent z-10"></div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                <div className="flex items-center gap-2 mb-2">
                    <div
                        className={`w-2 h-2 rounded-full ${project.status === "finished"
                            ? "bg-success animate-pulse"
                            : "bg-[#0d4b3d] animate-pulse"
                            }`}
                    ></div>
                    <span className="text-xs text-muted-foreground capitalize">
                        {project.status === "finished"
                            ? dictionary.web.home.cases.projectStatus.finished
                            : dictionary.web.home.cases.projectStatus.inProgress}
                    </span>
                </div>

                <h3 className={`font-semibold mb-2 text-foreground ${size === 'large' ? 'text-xl' : size === 'medium' ? 'text-lg' : 'text-sm'
                    }`}>
                    {project.title}
                </h3>

                <p className={`text-muted-foreground ${size === 'small' ? 'text-xs line-clamp-1' : 'text-sm line-clamp-2'
                    }`}>
                    {project.description}
                </p>
            </div>
        </div>
    );
}; 