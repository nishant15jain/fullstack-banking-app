import React, { useState, useEffect } from 'react';
import { transactionService } from '../../services/transactionService';
import { accountService } from '../../services/accountService';
import LoadingSpinner from '../common/LoadingSpinner';
import './TransactionForms.css';

const TransactionForms = ({ selectedAccountNumber, onTransactionSuccess }) => {
  const [activeTab, setActiveTab] = useState('deposit');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userAccounts, setUserAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  // Form data for each transaction type
  const [depositData, setDepositData] = useState({
    amount: '',
    description: ''
  });

  const [withdrawData, setWithdrawData] = useState({
    amount: '',
    description: ''
  });

  const [transferData, setTransferData] = useState({
    sourceAccountNumber: selectedAccountNumber || '',
    destinationAccountNumber: '',
    amount: '',
    description: ''
  });

  // Load user accounts on component mount
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const accounts = await accountService.getUserAccounts();
        setUserAccounts(accounts);
        if (selectedAccountNumber) {
          setTransferData(prev => ({ ...prev, sourceAccountNumber: selectedAccountNumber }));
        } else if (accounts.length > 0) {
          setTransferData(prev => ({ ...prev, sourceAccountNumber: accounts[0].accountNumber }));
        }
      } catch (err) {
        setError('Failed to load accounts');
      } finally {
        setLoadingAccounts(false);
      }
    };

    fetchAccounts();
  }, [selectedAccountNumber]);

  const resetForm = (formType) => {
    setError('');
    setSuccess('');
    
    switch (formType) {
      case 'deposit':
        setDepositData({ amount: '', description: '' });
        break;
      case 'withdraw':
        setWithdrawData({ amount: '', description: '' });
        break;
      case 'transfer':
        setTransferData(prev => ({ 
          ...prev, 
          destinationAccountNumber: '', 
          amount: '', 
          description: '' 
        }));
        break;
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!selectedAccountNumber) {
      setError('Please select an account first');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await transactionService.deposit(selectedAccountNumber, {
        amount: parseFloat(depositData.amount),
        description: depositData.description
      });

      setSuccess(`Deposit successful! Transaction ID: ${result.transactionRef}`);
      resetForm('deposit');
      
      if (onTransactionSuccess) {
        onTransactionSuccess(result);
      }
    } catch (err) {
      setError(err.message || 'Deposit failed');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!selectedAccountNumber) {
      setError('Please select an account first');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await transactionService.withdraw(selectedAccountNumber, {
        amount: parseFloat(withdrawData.amount),
        description: withdrawData.description
      });

      setSuccess(`Withdrawal successful! Transaction ID: ${result.transactionRef}`);
      resetForm('withdraw');
      
      if (onTransactionSuccess) {
        onTransactionSuccess(result);
      }
    } catch (err) {
      setError(err.message || 'Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    
    if (transferData.sourceAccountNumber === transferData.destinationAccountNumber) {
      setError('Source and destination accounts cannot be the same');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await transactionService.transfer(
        transferData.sourceAccountNumber,
        transferData.destinationAccountNumber,
        {
          amount: parseFloat(transferData.amount),
          description: transferData.description
        }
      );

      setSuccess(`Transfer successful! Transaction ID: ${result.transactionRef}`);
      resetForm('transfer');
      
      if (onTransactionSuccess) {
        onTransactionSuccess(result);
      }
    } catch (err) {
      setError(err.message || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  const isValidAmount = (amount) => {
    return amount && !isNaN(amount) && parseFloat(amount) > 0;
  };

  if (loadingAccounts) {
    return <LoadingSpinner />;
  }

  return (
    <div className="transaction-forms">
      <div className="transaction-tabs">
        <button 
          className={`tab-button ${activeTab === 'deposit' ? 'active' : ''}`}
          onClick={() => setActiveTab('deposit')}
        >
          Deposit
        </button>
        <button 
          className={`tab-button ${activeTab === 'withdraw' ? 'active' : ''}`}
          onClick={() => setActiveTab('withdraw')}
        >
          Withdraw
        </button>
        <button 
          className={`tab-button ${activeTab === 'transfer' ? 'active' : ''}`}
          onClick={() => setActiveTab('transfer')}
        >
          Transfer
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Deposit Form */}
      {activeTab === 'deposit' && (
        <form onSubmit={handleDeposit} className="transaction-form">
          <h3>Deposit Money</h3>
          {selectedAccountNumber && (
            <div className="account-info">
              <label>To Account:</label>
              <input type="text" value={selectedAccountNumber} readOnly />
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="deposit-amount">Amount ($)</label>
            <input
              id="deposit-amount"
              type="number"
              step="0.01"
              min="0.01"
              value={depositData.amount}
              onChange={(e) => setDepositData({ ...depositData, amount: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="deposit-description">Description (Optional)</label>
            <textarea
              id="deposit-description"
              value={depositData.description}
              onChange={(e) => setDepositData({ ...depositData, description: e.target.value })}
              placeholder="Enter transaction description..."
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || !selectedAccountNumber || !isValidAmount(depositData.amount)}
            className="submit-button"
          >
            {loading ? <LoadingSpinner size="small" /> : 'Deposit'}
          </button>
        </form>
      )}

      {/* Withdraw Form */}
      {activeTab === 'withdraw' && (
        <form onSubmit={handleWithdraw} className="transaction-form">
          <h3>Withdraw Money</h3>
          {selectedAccountNumber && (
            <div className="account-info">
              <label>From Account:</label>
              <input type="text" value={selectedAccountNumber} readOnly />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="withdraw-amount">Amount ($)</label>
            <input
              id="withdraw-amount"
              type="number"
              step="0.01"
              min="0.01"
              value={withdrawData.amount}
              onChange={(e) => setWithdrawData({ ...withdrawData, amount: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="withdraw-description">Description (Optional)</label>
            <textarea
              id="withdraw-description"
              value={withdrawData.description}
              onChange={(e) => setWithdrawData({ ...withdrawData, description: e.target.value })}
              placeholder="Enter transaction description..."
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || !selectedAccountNumber || !isValidAmount(withdrawData.amount)}
            className="submit-button"
          >
            {loading ? <LoadingSpinner size="small" /> : 'Withdraw'}
          </button>
        </form>
      )}

      {/* Transfer Form */}
      {activeTab === 'transfer' && (
        <form onSubmit={handleTransfer} className="transaction-form">
          <h3>Transfer Money</h3>
          
          <div className="form-group">
            <label htmlFor="source-account">From Account</label>
            <select
              id="source-account"
              value={transferData.sourceAccountNumber}
              onChange={(e) => setTransferData({ ...transferData, sourceAccountNumber: e.target.value })}
              required
              disabled={loading}
            >
              <option value="">Select source account</option>
              {userAccounts.map(account => (
                <option key={account.accountNumber} value={account.accountNumber}>
                  {account.accountNumber} - {account.accountType} (${account.balance})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="destination-account">To Account Number</label>
            <input
              id="destination-account"
              type="text"
              value={transferData.destinationAccountNumber}
              onChange={(e) => setTransferData({ ...transferData, destinationAccountNumber: e.target.value })}
              placeholder="Enter destination account number"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="transfer-amount">Amount ($)</label>
            <input
              id="transfer-amount"
              type="number"
              step="0.01"
              min="0.01"
              value={transferData.amount}
              onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="transfer-description">Description (Optional)</label>
            <textarea
              id="transfer-description"
              value={transferData.description}
              onChange={(e) => setTransferData({ ...transferData, description: e.target.value })}
              placeholder="Enter transaction description..."
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            disabled={
              loading || 
              !transferData.sourceAccountNumber || 
              !transferData.destinationAccountNumber || 
              !isValidAmount(transferData.amount)
            }
            className="submit-button"
          >
            {loading ? <LoadingSpinner size="small" /> : 'Transfer'}
          </button>
        </form>
      )}
    </div>
  );
};

export default TransactionForms;
