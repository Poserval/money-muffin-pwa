import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header.js';
import TotalBalance from './components/BalanceSummary.js';
import WalletGrid from './components/TransactionList.js';
import WalletModal from './components/TransactionForm.js';
import { CURRENCIES } from './types.js';

// Helper to format date
const formatDate = (date) => {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    return `${d}.${m}.${y}`;
};

// Using mock rates as we don't have a live API. This is for display conversion only.
const MOCK_RATES_TO_RUB = {
  RUB: 1,
  USD: 90,
  EUR: 100,
  CNY: 12.5,
  JPY: 0.58,
};

// --- Data Persistence ---
const loadInitialData = () => {
    const defaultWallets = [
        { id: 1, name: 'Наличка', amount: 14007, currency: 'RUB', lastUpdated: '25.10.2025', color: 'primary', isLocked: false },
        { id: 2, name: 'Сбер (Вклад)', amount: 100000, currency: 'RUB', lastUpdated: '25.10.2025', color: 'secondary', isLocked: true },
        { id: 3, name: 'Альфа банк (кредитка)', amount: -50000, currency: 'RUB', lastUpdated: '25.10.2025', color: 'danger', isLocked: false },
        { id: 4, name: 'Долларовый счет', amount: 1500, currency: 'USD', lastUpdated: '25.10.2025', color: 'info', isLocked: false },
        { id: 5, name: 'ВТБ (кредитка)', amount: -25000, currency: 'RUB', lastUpdated: '25.10.2025', color: 'primary', isLocked: false },
        { id: 6, name: 'Счет в Евро', amount: 800, currency: 'EUR', lastUpdated: '25.10.2025', color: 'cyan', isLocked: false },
        { id: 7, name: 'ДомРФ (вклад)', amount: 1000000, currency: 'RUB', lastUpdated: '25.10.2025', color: 'purple', isLocked: false },
    ];

    try {
        const savedWalletsRaw = localStorage.getItem('moneyMuffinWallets');
        const wallets = savedWalletsRaw ? JSON.parse(savedWalletsRaw) : defaultWallets;
        
        // Calculate initial baselines from wallets if nothing is saved
        const initialBaselines = Object.keys(CURRENCIES).reduce((acc, curr) => {
            acc[curr] = wallets
                .filter(w => w.currency === curr)
                .reduce((sum, w) => sum + w.amount, 0);
            return acc;
        }, {});

        const savedBaselinesRaw = localStorage.getItem('moneyMuffinBaselines');
        const baselineBalances = savedBaselinesRaw ? { ...initialBaselines, ...JSON.parse(savedBaselinesRaw) } : initialBaselines;

        return { wallets, baselineBalances };
    } catch (error) {
        console.error("Failed to load data from localStorage", error);
        const defaultBaselines = Object.keys(CURRENCIES).reduce((acc, curr) => {
            acc[curr] = defaultWallets
                .filter(w => w.currency === curr)
                .reduce((sum, w) => sum + w.amount, 0);
            return acc;
        }, {});
        return { wallets: defaultWallets, baselineBalances: defaultBaselines };
    }
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-card p-6 rounded-xl shadow-lg w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-text-primary mb-4">{title}</h3>
        <div className="text-text-secondary mb-6">{children}</div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="bg-slate-200 text-slate-700 py-2 px-4 rounded-md hover:bg-slate-300 transition-colors font-semibold"
          >
            Отмена
          </button>
          <button
            onClick={onConfirm}
            className="bg-danger text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-danger transition-colors font-semibold"
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
};


const App = () => {
  const [initialData] = useState(loadInitialData);
  const [wallets, setWallets] = useState(initialData.wallets);
  const [baselineBalances, setBaselineBalances] = useState(initialData.baselineBalances);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'amount', direction: 'desc' });
  const [displayCurrency, setDisplayCurrency] = useState('RUB');
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [walletToDeleteId, setWalletToDeleteId] = useState(null);


  // Effect to save wallets to localStorage
  useEffect(() => {
    try {
        localStorage.setItem('moneyMuffinWallets', JSON.stringify(wallets));
    } catch (error) {
        console.error("Could not save wallets to localStorage", error);
    }
  }, [wallets]);

  // Effect to save baselineBalances to localStorage
  useEffect(() => {
    try {
        localStorage.setItem('moneyMuffinBaselines', JSON.stringify(baselineBalances));
    } catch (error) {
        console.error("Could not save baseline balances to localStorage", error);
    }
  }, [baselineBalances]);
  
  const convertCurrency = (amount, from, to) => {
    const amountInRub = amount * MOCK_RATES_TO_RUB[from];
    return amountInRub / MOCK_RATES_TO_RUB[to];
  };

  // --- Balance Calculation ---
  // Calculates the sum for only the selected currency for display
  const totalForSelectedCurrency = useMemo(() => {
    if (wallets.length === 0) return 0;
    return wallets
        .filter(w => w.currency === displayCurrency)
        .reduce((sum, wallet) => sum + wallet.amount, 0);
  }, [wallets, displayCurrency]);

  // Calculates the difference based on the selected currency's baseline
  const balanceDifference = useMemo(() => {
    const currentTotal = totalForSelectedCurrency;
    const baseline = baselineBalances[displayCurrency] || 0;
    return currentTotal - baseline;
  }, [totalForSelectedCurrency, baselineBalances, displayCurrency]);
  
  const availableCurrencies = useMemo(() => {
    const currencies = new Set(wallets.map(w => w.currency));
    return Array.from(currencies).sort();
  }, [wallets]);

  // Effect to set the default display currency
  useEffect(() => {
    if (wallets.length === 0) {
        setDisplayCurrency('RUB');
        return;
    }
    const counts = wallets.reduce((acc, w) => {
        acc[w.currency] = (acc[w.currency] || 0) + 1;
        return acc;
    }, {});

    let maxCount = 0;
    let candidates = [];
    for (const currency in counts) {
        if (counts[currency] > maxCount) {
            maxCount = counts[currency];
            candidates = [currency];
        } else if (counts[currency] === maxCount) {
            candidates.push(currency);
        }
    }

    if (candidates.length === 1) {
        setDisplayCurrency(candidates[0]);
    } else {
        // Tie-breaker: choose currency with the largest total absolute value in RUB
        let maxAmount = -Infinity;
        let bestCurrency = candidates[0] || 'RUB';

        candidates.forEach(currency => {
            const totalAmountInRub = wallets
                .filter(w => w.currency === currency)
                .reduce((sum, w) => sum + Math.abs(convertCurrency(w.amount, w.currency, 'RUB')), 0);
            
            if (totalAmountInRub > maxAmount) {
                maxAmount = totalAmountInRub;
                bestCurrency = currency;
            }
        });
        setDisplayCurrency(bestCurrency);
    }
  }, [wallets]);

  const handleResetBalanceDifference = () => {
    setBaselineBalances(prevBaselines => ({
        ...prevBaselines,
        [displayCurrency]: totalForSelectedCurrency
    }));
  };

  const sortedWallets = useMemo(() => {
    let sortableItems = [...wallets];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [wallets, sortConfig]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleOpenModal = (wallet = null) => {
    if (wallet && wallet.isLocked) {
        alert('Этот кошелек заблокирован. Сначала разблокируйте его, чтобы внести изменения.');
        return;
    }
    setEditingWallet(wallet);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingWallet(null);
    setIsModalOpen(false);
  };

  const handleSaveWallet = (walletData) => {
    if (editingWallet) {
      // Update existing wallet
      setWallets(wallets.map(w => w.id === editingWallet.id ? { ...w, ...walletData, lastUpdated: formatDate(new Date()) } : w));
    } else {
      // Add new wallet to the top of the list
      const newWallet = { ...walletData, id: Date.now(), lastUpdated: formatDate(new Date()), isLocked: false };
      setWallets([newWallet, ...wallets]);
    }
    handleCloseModal();
  };

  const handleDeleteWallet = (walletId) => {
    const walletToDelete = wallets.find(w => w.id === walletId);
    if (walletToDelete?.isLocked) {
      alert('Этот кошелек заблокирован. Сначала разблокируйте его, чтобы удалить.');
      return;
    }
    setWalletToDeleteId(walletId);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (walletToDeleteId !== null) {
      setWallets(wallets.filter(w => w.id !== walletToDeleteId));
    }
    setIsDeleteConfirmOpen(false);
    setWalletToDeleteId(null);
  };
  
  const handleCloseDeleteConfirmation = () => {
    setIsDeleteConfirmOpen(false);
    setWalletToDeleteId(null);
  };

  const handleCopyWallet = (walletId) => {
    const walletToCopy = wallets.find(w => w.id === walletId);
    if (!walletToCopy) return;

    if (walletToCopy.isLocked) {
        alert('Этот кошелек заблокирован. Сначала разблокируйте его, чтобы скопировать.');
        return;
    }

    const newWallet = {
      ...walletToCopy,
      id: Date.now(),
      name: `${walletToCopy.name} - копия`,
      isLocked: false, // Copied wallets are unlocked by default
    };
    // Add copied wallet to the top
    setWallets([newWallet, ...wallets]);
  };
  
  const handleToggleLock = (walletId) => {
    setWallets(wallets.map(w => w.id === walletId ? { ...w, isLocked: !w.isLocked } : w));
  };

  const handleClearAllData = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirmClearAll = () => {
    setWallets([]);
    // Also reset the baseline balances
    setBaselineBalances({});
    setIsConfirmOpen(false);
  };

  const getSortIndicator = (key) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? '▲' : '▼';
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-6 pb-24">
        <TotalBalance 
          balance={totalForSelectedCurrency} 
          balanceDifference={balanceDifference}
          onResetDifference={handleResetBalanceDifference}
          displayCurrency={displayCurrency}
          availableCurrencies={availableCurrencies}
          onCurrencyChange={setDisplayCurrency}
        />
        
        <div className="mt-6">
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-bold text-text-primary">Мои кошельки</h2>
                <button 
                    onClick={() => handleOpenModal()}
                    className="bg-primary text-white font-bold py-1.5 px-3 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors text-sm"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Добавить
                </button>
            </div>

            <div className="flex items-center justify-between gap-2 mb-4 text-sm">
                <div className="flex items-center gap-2">
                    <span className="text-text-secondary">Сортировать по:</span>
                    <button onClick={() => handleSort('name')} className={`font-semibold px-2 py-1 rounded-md ${sortConfig?.key === 'name' ? 'bg-primary text-white' : 'bg-card hover:bg-slate-100'}`}>
                        Названию {getSortIndicator('name')}
                    </button>
                    <button onClick={() => handleSort('amount')} className={`font-semibold px-2 py-1 rounded-md ${sortConfig?.key === 'amount' ? 'bg-primary text-white' : 'bg-card hover:bg-slate-100'}`}>
                        Сумме {getSortIndicator('amount')}
                    </button>
                </div>
                {wallets.length > 0 && (
                    <button 
                        onClick={handleClearAllData}
                        className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors text-xl"
                        title="Очистить все данные"
                        aria-label="Очистить все данные"
                    >
                        📛
                    </button>
                )}
            </div>
            
            <WalletGrid 
              wallets={sortedWallets} 
              onEdit={handleOpenModal} 
              onDelete={handleDeleteWallet} 
              onCopy={handleCopyWallet}
              onToggleLock={handleToggleLock}
            />
        </div>
        
        {isModalOpen && (
            <WalletModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveWallet}
                walletToEdit={editingWallet}
            />
        )}

        <ConfirmationModal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleConfirmClearAll}
          title="Подтвердите действие"
        >
          Вы уверены, что хотите удалить все кошельки? Это действие необратимо.
        </ConfirmationModal>

        <ConfirmationModal
          isOpen={isDeleteConfirmOpen}
          onClose={handleCloseDeleteConfirmation}
          onConfirm={handleConfirmDelete}
          title="Удалить кошелек?"
        >
          Вы уверены, что хотите удалить этот кошелек? Это действие необратимо.
        </ConfirmationModal>
      </main>
    </div>
  );
};

export default App;