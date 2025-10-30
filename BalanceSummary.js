import React, { useState, useRef, useEffect } from 'react';
import { CURRENCIES } from '../types.js';

const ResetIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.667 0l3.181-3.183m-4.991-2.691L7.985 5.356m0 0v4.992m0 0h4.992m0 0l3.181-3.183a8.25 8.25 0 00-11.667 0L2.985 19.644z" />
    </svg>
);

const TotalBalance = ({ balance, balanceDifference, onResetDifference, displayCurrency, availableCurrencies, onCurrencyChange }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const differenceColor = balanceDifference > 0 ? 'text-success' : balanceDifference < 0 ? 'text-danger' : 'text-text-secondary';
  const differenceSign = balanceDifference > 0 ? '+' : '';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCurrencySelect = (currency) => {
    onCurrencyChange(currency);
    setIsDropdownOpen(false);
  };

  const formatCurrency = (value) => {
      return value.toLocaleString('ru-RU', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
      });
  };

  return (
    <div className="bg-card px-4 pt-6 pb-2 rounded-xl shadow-sm">
      {/* Main Balance Row */}
      <div className="flex justify-between items-center">
        <p className="text-lg font-semibold text-text-secondary">Общий баланс</p>
        
        <div className="flex items-center gap-3">
           <span
              className="text-4xl font-bold text-text-primary whitespace-nowrap leading-none relative"
              style={{ top: '0.05em' }}
            >
              {formatCurrency(balance)}
           </span>
           <div className="relative" ref={dropdownRef}>
              <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  disabled={availableCurrencies.length <= 1}
                  className={`text-xl font-bold text-text-primary rounded-full w-9 h-9 flex items-center justify-center border-2 border-slate-200 transition-colors ${availableCurrencies.length > 1 ? 'hover:bg-slate-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1' : 'cursor-default opacity-60'}`}
                  aria-haspopup="true"
                  aria-expanded={isDropdownOpen}
              >
                  {CURRENCIES[displayCurrency].symbol}
              </button>
              {isDropdownOpen && availableCurrencies.length > 1 && (
                  <div className="absolute right-0 mt-2 w-40 bg-card border border-slate-200 rounded-lg shadow-lg z-10">
                      {availableCurrencies.map(curr => (
                          <button
                              key={curr}
                              onClick={() => handleCurrencySelect(curr)}
                              className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-slate-100 first:rounded-t-lg last:rounded-b-lg"
                          >
                              {CURRENCIES[curr].symbol} ({CURRENCIES[curr].name})
                          </button>
                      ))}
                  </div>
              )}
           </div>
        </div>
      </div>
      
      {/* Balance Difference Row */}
      <div className="flex justify-end">
        <div 
          className="min-h-[20px] flex items-center -mt-1 relative"
          style={balanceDifference !== 0 ? { right: 'calc(2.25rem + 0.75rem)' } : {}}
        >
          {balanceDifference !== 0 && (
            <div className="flex items-center gap-1">
              <p className={`text-[10px] font-semibold ${differenceColor}`}>
                  {differenceSign}{formatCurrency(balanceDifference)} {CURRENCIES[displayCurrency].symbol}
              </p>
              <button
                  onClick={onResetDifference}
                  className="text-info hover:text-blue-700 focus:outline-none p-0.5 rounded-full hover:bg-slate-100 transition-colors"
                  title="Сбросить изменение"
                  aria-label="Сбросить отслеживание изменения баланса"
              >
                  <ResetIcon />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TotalBalance;