import React from 'react';
import { CURRENCIES } from '../types.js';

const WalletCard = ({ wallet, onEdit, onDelete, onCopy, onToggleLock }) => {
    const amountColor = wallet.amount < 0 ? 'text-danger' : 'text-text-primary';

    const borderClasses = {
        primary: 'border-primary',
        secondary: 'border-secondary',
        danger: 'border-danger',
        info: 'border-info',
        warning: 'border-warning',
        success: 'border-success',
        purple: 'border-purple',
        pink: 'border-pink',
        orange: 'border-orange',
        yellow: 'border-yellow',
        lime: 'border-lime',
        cyan: 'border-cyan',
        teal: 'border-teal',
        fuchsia: 'border-fuchsia',
        rose: 'border-rose',
        sky: 'border-sky',
        black: 'border-black',
        gray: 'border-gray',
        brown: 'border-brown',
    };

    return (
        <div 
            className={`bg-card p-2 rounded-lg shadow-sm border-t-4 ${borderClasses[wallet.color]} flex flex-col justify-between ${wallet.isLocked ? 'cursor-not-allowed' : 'cursor-default'}`}
        >
            <div>
                <h3 className="font-bold text-text-primary text-sm truncate">{wallet.name}</h3>
                <p className={`text-lg font-bold my-0.5 ${amountColor}`}>
                    {wallet.amount.toLocaleString('ru-RU', { style: 'currency', currency: wallet.currency, minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-text-secondary">
                    Изм: {wallet.lastUpdated}
                </p>
            </div>
            
            <div className="grid grid-cols-4 gap-1 mt-2 text-text-secondary">
                <button onClick={() => onEdit(wallet)} className="hover:text-primary p-1 text-base" aria-label={`Редактировать ${wallet.name}`}>✏️</button>
                <button onClick={() => onCopy(wallet.id)} className="hover:text-info p-1 text-base" aria-label={`Копировать ${wallet.name}`}>📋</button>
                <button onClick={() => onToggleLock(wallet.id)} className="hover:text-warning p-1 text-base" aria-label={`Заблокировать ${wallet.name}`}>{wallet.isLocked ? '🔐' : '🔒'}</button>
                <button onClick={() => onDelete(wallet.id)} className="hover:text-danger p-1 text-base" aria-label={`Удалить ${wallet.name}`}>🗑️</button>
            </div>
        </div>
    );
};

const WalletGrid = ({ wallets, onEdit, onDelete, onCopy, onToggleLock }) => {
  
  const groupedWallets = React.useMemo(() => {
    return wallets.reduce((acc, wallet) => {
      const currency = wallet.currency;
      (acc[currency] = acc[currency] || []).push(wallet);
      return acc;
    }, {});
  }, [wallets]);

  const currencyOrder = Object.keys(CURRENCIES).filter(c => groupedWallets[c]);

  return (
    <div className="space-y-6">
      {wallets.length > 0 ? (
        currencyOrder.map((currencyCode) => (
          <div key={currencyCode}>
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-md font-bold text-text-secondary whitespace-nowrap">{CURRENCIES[currencyCode].name}</h3>
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {groupedWallets[currencyCode].map((wallet) => (
                <WalletCard 
                  key={wallet.id} 
                  wallet={wallet} 
                  onEdit={onEdit} 
                  onDelete={onDelete} 
                  onCopy={onCopy}
                  onToggleLock={onToggleLock}
                />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="text-text-secondary text-center py-8 col-span-full bg-card rounded-lg">
          <p>Кошельки не найдены.</p>
          <p className="text-sm">Нажмите "Добавить", чтобы создать свой первый кошелек.</p>
        </div>
      )}
    </div>
  );
};

export default WalletGrid;