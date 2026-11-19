import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export function PublicLayout() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  return (
    <div className="flex min-h-screen w-full max-w-full flex-col overflow-x-hidden bg-brand-grey text-brand-black">
      <Navbar />
      <main className={`flex-1 min-w-0 ${isHome ? '' : 'pt-[60px] sm:pt-[66px]'}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
