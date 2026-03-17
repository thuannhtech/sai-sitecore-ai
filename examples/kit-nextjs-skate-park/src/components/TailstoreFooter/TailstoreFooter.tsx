'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube, 
  Phone, 
  Mail, 
  MapPin 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FooterLink {
  label: string;
  href: string;
}

const shopLinks: FooterLink[] = [
  { label: 'Shop', href: '/shop' },
  { label: 'Women', href: '/shop?gender=women' },
  { label: 'Men', href: '/shop?gender=men' },
  { label: 'Shoes', href: '/shop?category=shoes' },
  { label: 'Accessories', href: '/shop?category=accessories' },
];

const pageLinks: FooterLink[] = [
  { label: 'Shop', href: '/shop' },
  { label: 'Product', href: '/product/1' },
  { label: 'Checkout', href: '/checkout' },
  { label: '404', href: '/404' },
];

const accountLinks: FooterLink[] = [
  { label: 'Cart', href: '/cart' },
  { label: 'Registration', href: '/register' },
  { label: 'Login', href: '/login' },
];

const socialLinks = [
  { label: 'Facebook', href: '#', icon: Facebook, color: '#1877F2' },
  { label: 'Twitter', href: '#', icon: Twitter, color: '#1DA1F2' },
  { label: 'Instagram', href: '#', icon: Instagram, color: '#E4405F' },
  { label: 'YouTube', href: '#', icon: Youtube, color: '#FF0000' },
];

export const TailstoreFooter: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-line pt-16 font-manrope">
      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          {/* Shop Column */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-gray-dark">Shop</h3>
            <ul className="space-y-3">
              {shopLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-gray-txt hover:text-primary transition-colors duration-200 block">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Pages Column */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-gray-dark">Pages</h3>
            <ul className="space-y-3">
              {pageLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-gray-txt hover:text-primary transition-colors duration-200 block">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account Column */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-gray-dark">Account</h3>
            <ul className="space-y-3">
              {accountLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-gray-txt hover:text-primary transition-colors duration-200 block">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Follow Us Column */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-gray-dark">Follow Us</h3>
            <ul className="space-y-4">
              {socialLinks.map((social) => (
                <li key={social.label}>
                  <a 
                    href={social.href} 
                    className="flex items-center gap-3 text-gray-txt hover:text-primary transition-all group"
                  >
                    <div className="p-2 bg-gray-lighter rounded-lg group-hover:bg-primary transition-colors">
                      <social.icon className="w-5 h-5 group-hover:text-white" />
                    </div>
                    <span className="font-medium">{social.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div className="lg:col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold mb-6 text-gray-dark">Contact Us</h3>
            <div className="mb-6">
              <Image 
                src="/assets/images/template-logo.png" 
                alt="Tailstore" 
                width={120} 
                height={60} 
                className="h-12 w-auto mb-6"
              />
              <div className="space-y-4">
                <p className="flex items-center gap-3 text-gray-txt">
                  <MapPin className="w-5 h-5 text-primary shrink-0" />
                  123 Street Name, Paris, France
                </p>
                <div className="bg-gray-lighter p-4 rounded-xl">
                  <p className="text-xs text-gray-txt uppercase font-bold tracking-wider mb-1">Call us anytime</p>
                  <p className="text-xl font-extrabold text-gray-dark flex items-center gap-2">
                    <Phone className="w-5 h-5 text-primary" />
                    (123) 456-7890
                  </p>
                </div>
                <p className="flex items-center gap-3 text-gray-txt">
                  <Mail className="w-5 h-5 text-primary shrink-0" />
                  <a href="mailto:info@company.com" className="hover:text-primary underline font-medium">
                    info@company.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-dark py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
            <div className="text-center lg:text-left">
              <p className="text-white/80 font-bold mb-4">
                &copy; {new Date().getFullYear()} Tailstore. All rights reserved.
              </p>
              <ul className="flex flex-wrap justify-center lg:justify-start gap-6 text-sm text-white/50">
                <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">FAQ</Link></li>
              </ul>
              <p className="text-xs text-white/30 mt-6 max-w-xl">
                Experience the next generation of headless commerce with Tailstore. Built with Sitecore XM Cloud and OrderCloud for ultimate performance and flexibility.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
              <Image src="/assets/images/social_icons/paypal.svg" alt="PayPal" width={40} height={25} className="h-6 w-auto opacity-70 hover:opacity-100 transition-opacity" />
              <div className="w-px h-6 bg-white/10" />
              <Image src="/assets/images/social_icons/stripe.svg" alt="Stripe" width={40} height={25} className="h-6 w-auto opacity-70 hover:opacity-100 transition-opacity" />
              <div className="w-px h-6 bg-white/10" />
              <Image src="/assets/images/social_icons/visa.svg" alt="Visa" width={40} height={25} className="h-6 w-auto opacity-70 hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
