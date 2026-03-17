'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  ChevronDown,
  User,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOrderCloud } from '@/providers/OrderCloudProvider';
import { Text, NextImage as ContentSdkImage, Link as ContentSdkLink, Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

interface TailstoreHeaderItem {
  Name: Field<string>;
  Link: LinkField;
  Icon: ImageField;
  IsLogo: Field<boolean>;
  IsMainMenu: Field<boolean>;
  IsRightMenu: Field<boolean>;
}

interface Fields {
  items: {
    fields: TailstoreHeaderItem;
  }[];
}

type TailstoreHeaderProps = ComponentProps & {
  fields: Fields
};

export const Default: React.FC<TailstoreHeaderProps> = ({ fields }) => {
  const { items = [] } = fields || {};

  // Phân loại items để render đúng chỗ dựa trên cấu trúc i.fields.Field
  const logoItem = items.find(i => i.fields.IsLogo?.value)?.fields;
  const mainMenuItems = items.filter(i => i.fields.IsMainMenu?.value).map(i => i.fields);
  const rightMenuItems = items.filter(i => i.fields.IsRightMenu?.value).map(i => i.fields);
  debugger
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const pathname = usePathname();
  const { isAuthenticated, logout } = useOrderCloud();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "bg-gray-dark shadow-lg py-2" : "bg-gray-dark py-4"
      )}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        {logoItem ? (
          <ContentSdkLink field={logoItem.Link} className="flex items-center">
            <div className="relative h-12 w-32 md:h-14 md:w-40 transition-transform hover:scale-105">
              <ContentSdkImage
                field={logoItem.Icon}
                className="object-contain"
              />
            </div>
          </ContentSdkLink>
        ) : (
          <Link href="/" className="flex items-center">
            <div className="relative h-12 w-32 md:h-14 md:w-40 transition-transform hover:scale-105">
              <Image
                src="/assets/images/template-white-logo.png"
                alt="Tailstore Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>
        )}

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-8">
          <ul className="flex items-center space-x-6">
            {mainMenuItems.map((item, index) => (
              <li
                key={index}
                className="relative group"
              >
                <ContentSdkLink
                  field={item.Link}
                  className={cn(
                    "text-white font-semibold flex items-center gap-1 hover:text-secondary transition-colors py-2",
                    pathname === item.Link?.value?.href && "text-secondary"
                  )}
                >
                  <Text field={item.Name} />
                </ContentSdkLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center space-x-5">
          {isSearchOpen ? (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 200, opacity: 1 }}
              className="relative"
            >
              <input
                autoFocus
                type="text"
                placeholder="Search..."
                className="bg-white/10 text-white border border-white/20 rounded-full px-4 py-1 w-full focus:outline-none focus:border-secondary transition-all"
                onBlur={() => setIsSearchOpen(false)}
              />
              <Search className="absolute right-3 top-1.5 w-4 h-4 text-white/50" />
            </motion.div>
          ) : (
            <button
              onClick={() => setIsSearchOpen(true)}
              className="text-white hover:text-secondary transition-all hover:scale-110"
            >
              <Search className="w-6 h-6" />
            </button>
          )}

          <div className="flex items-center space-x-2 border-l border-white/20 pl-5">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link href="/account" className="text-white hover:text-secondary transition-colors">
                  <User className="w-6 h-6" />
                </Link>
                <button onClick={() => logout()} className="text-white hover:text-secondary transition-colors">
                  <LogOut className="w-6 h-6" />
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/register"
                  className="bg-primary text-white px-5 py-2 rounded-full font-bold border border-primary hover:bg-transparent hover:text-primary transition-all text-sm"
                >
                  Register
                </Link>
                <Link
                  href="/login"
                  className="bg-transparent text-white px-5 py-2 rounded-full font-bold border border-white hover:bg-white hover:text-gray-dark transition-all text-sm"
                >
                  Login
                </Link>
              </>
            )}
          </div>

          {/* Cart Icon */}
          <Link href="/cart" className="relative group">
            <div className="p-2 transition-transform group-hover:scale-110">
              <ShoppingCart className="w-6 h-6 text-white group-hover:text-secondary" />
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold border-2 border-gray-dark">
                0
              </span>
            </div>
            {/* Quick Cart Tooltip could go here */}
          </Link>
        </div>

        {/* Mobile Toggle */}
        <div className="lg:hidden flex items-center space-x-4">
          <Link href="/cart" className="relative p-2">
            <ShoppingCart className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
              0
            </span>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white p-2"
          >
            {isMobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 top-[64px] bg-gray-dark z-40 lg:hidden flex flex-col p-6 overflow-y-auto"
          >
            <div className="flex flex-col space-y-4 mb-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="What are you looking for?"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-secondary"
                />
                <Search className="absolute right-4 top-3.5 w-5 h-5 text-white/40" />
              </div>
            </div>

            <nav className="flex-1">
              <ul className="flex flex-col space-y-4">
                {mainMenuItems.map((item, index) => (
                  <li key={index} className="border-b border-white/10 pb-4">
                    <div className="flex justify-between items-center mb-2">
                      <ContentSdkLink
                        field={item.Link}
                        className="text-2xl font-bold text-white hover:text-secondary transition-colors"
                      >
                        <Text field={item.Name} />
                      </ContentSdkLink>
                    </div>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="mt-auto pt-8 flex flex-col space-y-4">
              {isAuthenticated ? (
                <button
                  onClick={() => logout()}
                  className="w-full bg-white/10 text-white font-bold py-4 rounded-xl border border-white/20 flex items-center justify-center gap-2"
                >
                  <LogOut className="w-5 h-5" /> Logout
                </button>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="w-full bg-white text-gray-dark font-bold py-4 rounded-xl flex items-center justify-center"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="w-full border border-primary text-primary font-bold py-4 rounded-xl flex items-center justify-center"
                  >
                    Create Account
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
