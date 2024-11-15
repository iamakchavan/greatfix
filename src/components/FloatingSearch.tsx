import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Globe, Layout, FileText, Loader2 } from 'lucide-react';

interface FloatingSearchProps {
  isSummarized: boolean;
  onSearch: (query: string) => void;
}

interface Suggestion {
  id: string;
  text: string;
}

export const FloatingSearch: React.FC<FloatingSearchProps> = ({ isSummarized, onSearch }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchScope, setSearchScope] = useState<'all' | 'domain' | 'page'>('page');
  const [showScopeMenu, setShowScopeMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isExpanded && isSummarized) {
      setSuggestions([
        { id: '1', text: 'Explain the main concepts' },
        { id: '2', text: 'Find key takeaways' },
        { id: '3', text: 'Summarize in bullet points' }
      ]);
    }
  }, [isExpanded, isSummarized]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node) &&
        !isLoading
      ) {
        setIsExpanded(false);
        setShowScopeMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isLoading]);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || isLoading) return;

    setIsLoading(true);
    setShowScopeMenu(false);

    const query = `[${searchScope.toUpperCase()}] ${searchQuery}`;
    
    try {
      await onSearch(query);
    } finally {
      setIsLoading(false);
      setSearchQuery('');
      setIsExpanded(false);
    }
  };

  const handleSuggestionClick = async (suggestion: Suggestion) => {
    setIsLoading(true);
    try {
      await onSearch(`[PAGE] ${suggestion.text}`);
    } finally {
      setIsLoading(false);
      setIsExpanded(false);
    }
  };

  const scopeIcons = {
    all: <Globe className="w-4 h-4" />,
    domain: <Layout className="w-4 h-4" />,
    page: <FileText className="w-4 h-4" />
  };

  const scopeLabels = {
    all: 'Search everywhere',
    domain: 'Search this domain',
    page: 'Search this page'
  };

  if (!isSummarized) return null;

  return (
    <>
      {(showScopeMenu || isExpanded) && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-[2px] transition-all duration-500 ease-out"
          onClick={() => {
            setShowScopeMenu(false);
            if (!isLoading) setIsExpanded(false);
          }}
        />
      )}
      <div className="fixed bottom-4 left-4 z-50" ref={searchContainerRef}>
        <form 
          onSubmit={handleSubmit}
          className={`flex flex-col items-start transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]`}
        >
          {/* Suggestions */}
          {isExpanded && (
            <div className="mb-3 space-y-2 transform origin-bottom transition-all duration-300 ease-out">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="flex items-center px-4 py-2 rounded-full bg-white/90 dark:bg-gray-800/90 
                    border border-gray-200 dark:border-gray-700 
                    hover:border-gray-300 dark:hover:border-gray-600
                    hover:bg-gray-50/80 dark:hover:bg-gray-700/90
                    transform transition-all duration-300 ease-out hover:scale-[1.02]
                    backdrop-blur-sm backdrop-saturate-150 group"
                >
                  <span className="text-sm text-gray-700 dark:text-gray-200 font-medium">
                    <span className="text-blue-500 dark:text-blue-400 mr-2">"</span>
                    {suggestion.text}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Search Input */}
          <div
            className={`relative flex items-center transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
              ${isExpanded ? 'w-[300px]' : 'w-10'}`}
          >
            <div
              className={`relative flex items-center bg-white/90 dark:bg-gray-800/90 
                shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-500
                ease-[cubic-bezier(0.23,1,0.32,1)] backdrop-blur-sm backdrop-saturate-150
                ${isExpanded ? 'w-full rounded-full ring-2 ring-blue-100 dark:ring-blue-900' : 'w-10 h-10 rounded-full hover:scale-110'}
                ${isLoading ? 'border-blue-500 dark:border-blue-400' : ''}
                ${!isExpanded && !isLoading ? 'animate-bounce-subtle search-icon-glow search-icon-pulse' : ''}`}
            >
              <button
                type="button"
                onClick={() => {
                  if (!isLoading) {
                    setIsExpanded(!isExpanded);
                    setShowScopeMenu(false);
                  }
                }}
                disabled={isLoading}
                className={`flex items-center justify-center transition-all duration-500 relative z-10
                  ${isExpanded ? 'w-10 h-10 rotate-90' : 'w-full h-full hover:rotate-12'}`}
              >
                {isLoading ? (
                  <div className="relative">
                    <Loader2 className="w-5 h-5 text-blue-500 dark:text-blue-400 animate-spin" />
                  </div>
                ) : isExpanded ? (
                  <X className="w-5 h-5 text-gray-500 hover:text-gray-700 dark:text-gray-400 
                    dark:hover:text-gray-300 transition-colors" />
                ) : (
                  <Search className="w-5 h-5 text-gray-500 hover:text-gray-700 dark:text-gray-400 
                    dark:hover:text-gray-300 transition-colors" />
                )}
              </button>

              <div className={`flex-1 flex items-center overflow-hidden transition-all duration-500
                ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                <button
                  type="button"
                  onClick={() => !isLoading && setShowScopeMenu(!showScopeMenu)}
                  disabled={isLoading}
                  className="flex items-center justify-center w-10 h-10 text-gray-500 
                    hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300
                    transition-transform hover:scale-110 disabled:opacity-50"
                >
                  {scopeIcons[searchScope]}
                </button>

                <div className="relative flex-1 flex items-center">
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isLoading ? 'Generating answer...' : scopeLabels[searchScope]}
                    disabled={isLoading}
                    className="outline-none bg-transparent text-gray-700 dark:text-gray-200 
                      placeholder-gray-500 dark:placeholder-gray-500 text-sm w-full px-2
                      disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {showScopeMenu && !isLoading && (
              <div className="absolute left-10 bottom-14 bg-white/90 dark:bg-gray-800/90 rounded-full 
                shadow-lg border border-gray-200 dark:border-gray-700 py-2 min-w-[200px]
                transform origin-bottom-left animate-in slide-in-from-bottom-2 duration-200
                backdrop-blur-sm backdrop-saturate-150"
              >
                {(Object.keys(scopeIcons) as Array<keyof typeof scopeIcons>).map((scope) => (
                  <button
                    key={scope}
                    type="button"
                    onClick={() => {
                      setSearchScope(scope);
                      setShowScopeMenu(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left
                      transition-all duration-200 hover:scale-105
                      ${searchScope === scope 
                        ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50/80 dark:hover:bg-gray-700/80'
                      }`}
                  >
                    <span className="transition-transform duration-200 hover:scale-110">
                      {scopeIcons[scope]}
                    </span>
                    <span>{scopeLabels[scope]}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </form>
      </div>
    </>
  );
};