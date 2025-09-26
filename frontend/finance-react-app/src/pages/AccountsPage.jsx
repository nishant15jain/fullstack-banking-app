import React, { useState, useEffect } from 'react';
import { accountService } from '../services/accountService';
import CreateAccountForm from '../components/accounts/CreateAccountForm';
import TransactionForms from '../components/transactions/TransactionForms';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Navigation from '../components/common/Navigation';
import { formatCurrency, formatDateShort, getAccountStatusColor } from '../utils/formatters';
import './AccountsPage.css';

const AccountsPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, account: null });
  const [deleting, setDeleting] = useState(false);
  
  // Transaction modal state
  const [showTransactionForms, setShowTransactionForms] = useState(false);
  const [selectedAccountForTransaction, setSelectedAccountForTransaction] = useState(null);
  
  // Account details modal state
  const [accountDetailsModal, setAccountDetailsModal] = useState({
    isOpen: false,
    account: null
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      setError('');
      const accountsData = await accountService.getUserAccounts();
      setAccounts(accountsData);
    } catch (err) {
      setError('Failed to load accounts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccountCreated = (newAccount) => {
    setAccounts(prev => [...prev, newAccount]);
    setShowCreateAccount(false);
  };

  const handleViewAccount = (account) => {
    setAccountDetailsModal({
      isOpen: true,
      account
    });
  };

  const handleDeposit = (account) => {
    setSelectedAccountForTransaction(account.accountNumber);
    setShowTransactionForms(true);
    setError('');
  };

  const handleWithdraw = (account) => {
    setSelectedAccountForTransaction(account.accountNumber);
    setShowTransactionForms(true);
    setError('');
  };

  const handleDeleteAccount = (account) => {
    setDeleteDialog({ isOpen: true, account });
  };

  const confirmDeleteAccount = async () => {
    if (!deleteDialog.account) return;
    
    setDeleting(true);
    setError(''); // Clear any previous errors
    
    try {
      await accountService.deleteAccount(deleteDialog.account.accountNumber);
      
      // Remove the account from the list
      setAccounts(prev => prev.filter(acc => acc.id !== deleteDialog.account.id));
      setDeleteDialog({ isOpen: false, account: null });
    } catch (err) {
      // Better error handling based on response
      let errorMessage = 'Failed to delete account. Please try again.';
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'You are not authorized to delete this account.';
        } else if (err.response.status === 404) {
          errorMessage = 'Account not found.';
        } else if (err.response.status === 403) {
          // Use the specific error message from the backend
          errorMessage = err.response.data?.error || 'Access denied. You cannot delete this account.';
        } else if (err.response.data && err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setDeleteDialog({ isOpen: false, account: null });
    } finally {
      setDeleting(false);
    }
  };

  const cancelDeleteAccount = () => {
    setDeleteDialog({ isOpen: false, account: null });
  };

  const handleTransactionSuccess = (transactionResult) => {
    // Reload accounts to get updated balances
    loadAccounts();
    
    // Close the transaction forms modal
    setShowTransactionForms(false);
    setSelectedAccountForTransaction(null);
    
    // Show success message briefly
    setError('');
  };

  const closeAccountDetails = () => {
    setAccountDetailsModal({ isOpen: false, account: null });
  };

  if (loading) {
    return (
      <>
        <Navigation title="Accounts" />
        <div className="accounts-page">
          <div className="accounts-header">
            <h1>My Accounts</h1>
          </div>
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your accounts...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation title="Accounts" />
      <div className="accounts-page">
      <div className="accounts-header">
        <h1>My Accounts</h1>
        <button 
          className="btn-primary"
          onClick={() => setShowCreateAccount(true)}
        >
          + Create New Account
        </button>
      </div>

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={loadAccounts} className="btn-danger">
            Retry
          </button>
        </div>
      )}

      {accounts.length === 0 ? (
        <div className="no-data">
          <div className="no-data-icon">🏦</div>
          <h2>No Accounts Found</h2>
          <p>Create your first account to start banking with us!</p>
          <button 
            className="btn-success"
            onClick={() => setShowCreateAccount(true)}
          >
            Create Your First Account
          </button>
        </div>
      ) : (
        <div className="accounts-grid">
          {accounts.map((account) => (
            <div key={account.id} className="card account-card">
              <div className="account-card-header">
                <h3>{account.accountType} Account</h3>
                <span 
                  className="account-status"
                  style={{ color: getAccountStatusColor(account.accountStatus) }}
                >
                  {account.accountStatus}
                </span>
              </div>
              
              <div className="account-balance">
                <span className="balance-label">Current Balance</span>
                <span className="balance-amount">{formatCurrency(account.balance)}</span>
              </div>
              
              <div className="account-details">
                <div className="account-info-row">
                  <span className="label">Account Number:</span>
                  <span className="value">••••{account.accountNumber.slice(-4)}</span>
                </div>
                <div className="account-info-row">
                  <span className="label">Created:</span>
                  <span className="value">{formatDateShort(account.createdAt)}</span>
                </div>
              </div>
              
              <div className="account-actions">
                <button 
                  className="btn-primary view-details-btn"
                  onClick={() => handleViewAccount(account)}
                >
                  View Details
                </button>
                <button 
                  className="quick-action-btn deposit"
                  onClick={() => handleDeposit(account)}
                >
                  Deposit
                </button>
                <button 
                  className="quick-action-btn withdraw"
                  onClick={() => handleWithdraw(account)}
                >
                  Withdraw
                </button>
                <button 
                  className="quick-action-btn delete"
                  onClick={() => handleDeleteAccount(account)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateAccount && (
        <CreateAccountForm 
          onAccountCreated={handleAccountCreated}
          onCancel={() => setShowCreateAccount(false)}
        />
      )}

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Account"
        message={
          deleteDialog.account 
            ? `Are you sure you want to delete your ${deleteDialog.account.accountType} account ending in ${deleteDialog.account.accountNumber.slice(-4)}? This action cannot be undone.`
            : ''
        }
        confirmText={deleting ? "Deleting..." : "Delete Account"}
        cancelText="Cancel"
        onConfirm={confirmDeleteAccount}
        onCancel={cancelDeleteAccount}
        type="danger"
      />

      {/* Transaction Forms Modal */}
      {showTransactionForms && (
        <div className="create-account-overlay">
          <div className="create-account-modal transaction-modal">
            <div className="modal-header">
              <h2>Account Transactions</h2>
              <button 
                className="close-button"
                onClick={() => {
                  setShowTransactionForms(false);
                  setSelectedAccountForTransaction(null);
                }}
              >
                ×
              </button>
            </div>

            <TransactionForms 
              selectedAccountNumber={selectedAccountForTransaction}
              onTransactionSuccess={handleTransactionSuccess}
            />
          </div>
        </div>
      )}

      {/* Account Details Modal */}
      {accountDetailsModal.isOpen && (
        <div className="create-account-overlay">
          <div className="create-account-modal">
            <div className="modal-header">
              <h2>Account Details</h2>
              <button 
                className="close-button"
                onClick={closeAccountDetails}
              >
                ×
              </button>
            </div>

            <div className="account-details-content">
              <div className="detail-section">
                <h3>Account Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Account Type:</label>
                    <span>{accountDetailsModal.account?.accountType}</span>
                  </div>
                  <div className="detail-item">
                    <label>Account Number:</label>
                    <span>{accountDetailsModal.account?.accountNumber}</span>
                  </div>
                  <div className="detail-item">
                    <label>Status:</label>
                    <span 
                      style={{ 
                        color: getAccountStatusColor(accountDetailsModal.account?.accountStatus),
                        fontWeight: '600'
                      }}
                    >
                      {accountDetailsModal.account?.accountStatus}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Current Balance:</label>
                    <span className="balance-highlight">
                      {formatCurrency(accountDetailsModal.account?.balance)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Created Date:</label>
                    <span>{formatDateShort(accountDetailsModal.account?.createdAt)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Last Updated:</label>
                    <span>{formatDateShort(accountDetailsModal.account?.updatedAt)}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Quick Actions</h3>
                <div className="quick-actions-grid">
                  <button 
                    className="btn-primary"
                    onClick={() => {
                      closeAccountDetails();
                      setSelectedAccountForTransaction(accountDetailsModal.account.accountNumber);
                      setShowTransactionForms(true);
                    }}
                  >
                    Make Transaction
                  </button>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="cancel-button"
                onClick={closeAccountDetails}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default AccountsPage;
