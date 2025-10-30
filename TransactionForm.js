import React, { useState, useEffect } from 'react';
import { CURRENCIES } from '../types.js';

const COLORS = ['primary', 'secondary', 'danger', 'info', 'warning', 'success', 'purple', 'pink', 'orange', 'yellow', 'lime', 'cyan', 'teal', 'fuchsia', 'rose', 'sky', 'black', 'gray', 'brown'];

const colorClasses = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    danger: 'bg-danger',
    info: 'bg-info',
    warning: 'bg-warning',
    success: 'bg-success',
    purple: 'bg-purple',
    pink: 'bg-pink',
    orange: 'bg-orange',
    yellow: 'bg-yellow',
    lime: 'bg-lime',
    cyan: 'bg-cyan',
    teal: 'bg-teal',
    fuchsia: 'bg-fuchsia',
    rose: 'bg-rose',
    sky: 'bg-sky',
    black: 'bg-black',
    gray: 'bg-gray',
    brown: 'bg-brown',
};


const WalletModal = ({ isOpen, onClose, onSave, walletToEdit }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('RUB');
  const [color, setColor] = useState('primary');

  useEffect(() => {
    if (walletToEdit) {
      setName(walletToEdit.name);
      setAmount(String(walletToEdit.amount));
      setCurrency(walletToEdit.currency);
      setColor(walletToEdit.color);
    } else {
      // Reset form for new wallet
      setName('');
      setAmount('');
      setCurrency('RUB');
      setColor('primary');
    }
  }, [walletToEdit, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || amount === '') {
      alert('Пожалуйста, заполните название и сумму.');
      return;
    }
    onSave({
      name,
      amount: parseFloat(amount) || 0,
      currency,
      color,
    });
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bg-card p-6 rounded-xl shadow-lg w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-bold mb-4">{walletToEdit ? 'Редактировать кошелек' : 'Добавить кошелек'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-secondary">Название</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="e.g., Наличка"
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
                <label htmlFor="amount" className="block text-sm font-medium text-text-secondary">Сумма</label>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                    focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="0.00"
                  step="any"
                  required
                />
            </div>
            <div>
                <label htmlFor="currency" className="block text-sm font-medium text-text-secondary">Валюта</label>
                <select
                    id="currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                >
                    {Object.keys(CURRENCIES).map(c => (
                        <option key={c} value={c}>
                            {CURRENCIES[c].symbol} ({c})
                        </option>
                    ))}
                </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary">Цвет</label>
            <div className="flex flex-wrap gap-3 mt-2" role="radiogroup">
                {COLORS.map(c => (
                    <button
                        type="button"
                        key={c}
                        onClick={() => setColor(c)}
                        className={`w-8 h-8 rounded-full ${colorClasses[c]} transition-transform hover:scale-110 focus:outline-none ${color === c ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                        aria-label={`Выбрать цвет ${c}`}
                        role="radio"
                        aria-checked={color === c}
                    />
                ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
             <button
                type="button"
                onClick={onClose}
                className="bg-slate-200 text-slate-700 py-2 px-4 rounded-md hover:bg-slate-300 transition-colors font-semibold"
             >
                Отмена
             </button>
             <button
                type="submit"
                className="bg-primary text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors font-semibold"
             >
                {walletToEdit ? 'Сохранить' : 'Создать'}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WalletModal;