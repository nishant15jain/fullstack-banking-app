import React, { useState } from 'react';
import { accountService } from '../../services/accountService';
import './CreateAccountForm.css';

const CreateAccountForm = ({ onAccountCreated, onCancel }) => {
  const [formData, setFormData] = useState({
    accountType: 'SAVINGS',
    initialBalance: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const accountData = {
        accountType: formData.accountType,
        balance: Math.max(0, parseFloat(formData.initialBalance) || 0)
      };

      const newAccount = await accountService.createAccount(accountData);
      onAccountCreated(newAccount);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-account-overlay">
      <div className="create-account-modal">
        <div className="modal-header">
          <h2>Create New Account</h2>
          <button 
            className="close-button"
            onClick={onCancel}
            disabled={loading}
          >
            ×
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="create-account-form">
          <div className="form-group">
            <label htmlFor="accountType">Account Type</label>
            <select
              id="accountType"
              name="accountType"
              value={formData.accountType}
              onChange={handleChange}
              className="form-select"
              disabled={loading}
              required
            >
              <option value="SAVINGS">Savings Account</option>
              <option value="CURRENT">Current Account</option>
            </select>
            <small className="form-help">
              {formData.accountType === 'SAVINGS' 
                ? 'Savings accounts are ideal for storing money and earning interest.'
                : 'Current accounts are designed for frequent transactions and daily banking needs.'
              }
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="initialBalance">Initial Balance (Optional)</label>
            <div className="input-with-currency">
              <span className="currency-symbol">$</span>
              <input
                id="initialBalance"
                name="initialBalance"
                type="number"
                step="0.01"
                min="0"
                value={formData.initialBalance}
                onChange={handleChange}
                className="form-input"
                placeholder="0.00"
                disabled={loading}
              />
            </div>
            <small className="form-help">
              You can add funds to your account later through deposits.
            </small>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary submit-button"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAccountForm;
