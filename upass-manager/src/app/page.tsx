"use client";

import Header from '../app/components/Header';
import Footer from '../app/components/Footer';
import Login from '../app/views/Login';

export default function Home() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <main className="flex-grow flex items-center justify-center overflow-hidden">
        <Login />
      </main>
      <Footer />
    </div>
  );
}
