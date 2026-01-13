import { Outlet } from 'react-router-dom';
import { Header } from './Header';

export const AppLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 md:py-8">
        <Outlet />
      </main>
    </div>
  );
};
