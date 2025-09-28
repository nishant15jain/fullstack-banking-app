import React, { useState } from 'react';
import { useAccounts, useDeleteAccount } from '../hooks/useAccounts';
import CreateAccountForm from '../components/accounts/CreateAccountForm';
import TransactionForms from '../components/transactions/TransactionForms';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Navigation from '../components/common/Navigation';
import { formatCurrency, formatDateShort, getAccountStatusColor } from '../utils/formatters';
import './AccountsPage.css';

const AccountsPage = () => {
  // React Query hooks
  const { data: accounts = [], isLoading: loading, error: queryError, refetch } = useAccounts();
  const deleteAccountMutation = useDeleteAccount();
  
  // Local state
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, account: null });
  
  // Transaction modal state
  const [showTransactionForms, setShowTransactionForms] = useState(false);
  const [selectedAccountForTransaction, setSelectedAccountForTransaction] = useState(null);
  
  // Account details modal state
  const [accountDetailsModal, setAccountDetailsModal] = useState({
    isOpen: false,
    account: null
  });

  // Convert query error to string for display
  const error = queryError ? 'Failed to load accounts. Please try again.' : '';

  const handleAccountCreated = (newAccount) => {
    // React Query will automatically update the cache via the mutation
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
    
    try {
      await deleteAccountMutation.mutateAsync(deleteDialog.account.accountNumber);
      setDeleteDialog({ isOpen: false, account: null });
    } catch (err) {
      // Error handling is managed by React Query, but we can still show user-friendly messages
      console.error('Failed to delete account:', err);
      setDeleteDialog({ isOpen: false, account: null });
    }
  };

  const cancelDeleteAccount = () => {
    setDeleteDialog({ isOpen: false, account: null });
  };

  const handleTransactionSuccess = (transactionResult) => {
    // Refetch accounts to get updated balances
    refetch();
    
    // Close the transaction forms modal
    setShowTransactionForms(false);
    setSelectedAccountForTransaction(null);
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
          <button onClick={() => refetch()} className="btn-danger">
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
        confirmText={deleteAccountMutation.isPending ? "Deleting..." : "Delete Account"}
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
