import React from 'react';

interface ContentLayoutProps {
  children: React.ReactNode;
  maxWidth?: string;
}

export default function ContentLayout({ 
  children, 
  maxWidth = "max-w-7xl" 
}: ContentLayoutProps) {
  return (
    <main className={`container ${maxWidth} mx-auto px-4 sm:px-6 py-8`}>
      {children}
    </main>
  );
}