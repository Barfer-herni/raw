'use client';

import { env } from '@/env';

import { Button } from '@repo/design-system/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@repo/design-system/components/ui/navigation-menu';
import { Menu, MoveRight, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

import type { Dictionary } from '@repo/internationalization';
import Image from 'next/image';
import logo from '@/public/barfer.png';

type HeaderProps = {
  dictionary: Dictionary;
  locale: string;
};

export const Header = ({ dictionary, locale }: HeaderProps) => {
  const pathname = usePathname();

  const navigationItems = [
    {
      title: dictionary.web.header.features || 'Features',
      href: `/${locale}#features`,
    },
    // {
    //   title: dictionary.web.header.pricing || 'Pricing',
    //   href: `/${locale}/pricing`,
    // },
    {
      title: dictionary.web.header.about || 'About',
      href: `/${locale}#faq`,
    },
    {
      title: dictionary.web.header.contact || 'Contact',
      href: `/${locale}/contact`,
    }
  ];

  // Ensure first letter is capitalized for all navigation items
  const capitalizeFirstLetter = (string: string): string => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  const [isOpen, setOpen] = useState(false);
  return (
    <header className="sticky top-0 left-0 z-40 w-full border-b bg-background">
      <div className="container relative mx-auto flex items-center justify-between min-h-20 px-4">
        {/* Logo on the left */}
        <div className="flex items-center">
          <Link href={`/${locale}`} className="flex items-center">
            <div className="relative flex items-center">
              <Image
                src={logo}
                alt="LupaPyme"
                width={180}
                height={60}
                className="w-auto h-16"
              />
            </div>
          </Link>
        </div>

        {/* Navigation in the center - desktop only */}
        <div className="hidden lg:flex items-center justify-center flex-1">
          <NavigationMenu>
            <NavigationMenuList className="flex flex-row justify-center gap-2">
              {navigationItems.map((item) => (
                <NavigationMenuItem key={item.title}>
                  <NavigationMenuLink asChild>
                    <Button variant="ghost" asChild className="font-nunito font-bold hover:bg-gray-100 dark:hover:bg-gray-800 px-2">
                      <Link href={item.href}>{capitalizeFirstLetter(item.title)}</Link>
                    </Button>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right side buttons */}
        <div className="flex items-center gap-2">
          <Button className="bg-[#0d4b3d] hover:bg-[#0d4b3d]/90 text-white font-nunito font-bold px-3 py-1 h-9" asChild>
            <Link href={`${env.NEXT_PUBLIC_APP_URL}/${locale}/sign-in`}>
              {dictionary.web.header.getStarted || 'Get Started'}
            </Link>

          </Button>

          {/* Mobile menu button */}
          <Button variant="ghost" onClick={() => setOpen(!isOpen)} className="lg:hidden ml-2 px-2">
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile navigation menu */}
        {isOpen && (
          <div className="lg:hidden container absolute top-16 left-0 right-0 flex w-full flex-col gap-6 border-t bg-background py-4 shadow-lg z-50">
            {navigationItems.map((item) => (
              <div key={item.title}>
                <div className="flex flex-col gap-2">
                  <Link
                    href={item.href}
                    className="flex items-center justify-between font-nunito font-bold px-4"
                    onClick={() => setOpen(false)}
                  >
                    <span className="text-lg">{capitalizeFirstLetter(item.title)}</span>
                    <MoveRight className="h-4 w-4 stroke-1 text-muted-foreground" />
                  </Link>
                </div>
              </div>
            ))}
            <div className="px-4">
              {env.NEXT_PUBLIC_APP_URL && (
                <Link
                  href={`${env.NEXT_PUBLIC_APP_URL}/${locale}/sign-in`}
                  className="flex items-center justify-between font-nunito font-bold text-[#0d4b3d]"
                  onClick={() => setOpen(false)}
                >
                  <span className="text-lg">{dictionary.web.header.getStarted || 'Get Started'}</span>
                  <MoveRight className="h-4 w-4 stroke-1 text-[#0d4b3d]" />
                </Link>
              )}
            </div>
            <div className="px-4">
              {env.NEXT_PUBLIC_APP_URL && (
                <Link
                  href={`${env.NEXT_PUBLIC_APP_URL}/${locale}/sign-in`}
                  className="flex items-center justify-between font-nunito font-bold text-[#0d4b3d]"
                  onClick={() => setOpen(false)}
                >
                  <span className="text-lg">{dictionary.web.header.logIn || 'Log In'}</span>
                  <MoveRight className="h-4 w-4 stroke-1 text-[#0d4b3d]" />
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
