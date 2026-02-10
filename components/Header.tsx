'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
const Header = () => {
  const pathname = usePathname();

  return (
    <header>
      <div className="main-container inner">
        <Link href="/">
          <Image src="/logo.svg" alt="CoinPulse logo" width={40} height={40} />
        </Link>

        <nav>
          <Link
            href="/"
            className={cn('nav-link', {
              'is-active': pathname === '/',
              'is-home': true,
            })}
          >
            Home
          </Link>

          <Link
            href="/coins"
            className={cn('nav-link', {
              'is-active': pathname === '/coins' || pathname.startsWith('/coins/'),
            })}
          >
            Coins
          </Link>

          <Link
            href="/exchanges"
            className={cn('nav-link', {
              'is-active': pathname === '/exchanges',
            })}
          >
            Exchanges
          </Link>

          <Link
            href="/global"
            className={cn('nav-link', {
              'is-active': pathname === '/global',
            })}
          >
            Market
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
