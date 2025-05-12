import { Suspense } from 'react';
import SearchContent from './SearchContent';

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="text-center py-8">Loading search results...</div>}>
      <SearchContent />
    </Suspense>
  );
}