// src/controllers/transaction.controller.js
import Transaction from './transaction.model.js';
import Account from '../account/account.model.js';

/**
 * Obtener todas las transacciones
 */
export const getAllTransactions = async (req, res) => {
  try {
    const txns = await Transaction.find()
      .populate('account', 'accountNumber balance')
      .populate('relatedAccount', 'accountNumber');
    res.status(200).json({ success: true, transactions: txns });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al obtener transacciones', error: err.message });
  }
};

/**
 * Obtener una transacción por ID
 */
export const getTransactionById = async (req, res) => {
  const { id } = req.params;
  try {
    const txn = await Transaction.findById(id)
      .populate('account', 'accountNumber balance')
      .populate('relatedAccount', 'accountNumber');
    if (!txn) {
      return res.status(404).json({ success: false, message: 'Transacción no encontrada' });
    }
    res.status(200).json({ success: true, transaction: txn });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al obtener la transacción', error: err.message });
  }
};

/**
 * Depósito: crea la transacción y actualiza el saldo
 */
export const deposit = async (req, res) => {
  const { accountId, amount } = req.body;
  try {
    const acct = await Account.findById(accountId);
    if (!acct || !acct.status) {
      return res.status(404).json({ success: false, message: 'Cuenta no encontrada o inactiva' });
    }
    acct.balance += amount;
    await acct.save();
    const txn = await Transaction.create({
      account: accountId,
      type: 'DEPOSITO',
      amount,
    });
    res.status(201).json({ success: true, transaction: txn, balance: acct.balance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al procesar depósito', error: err.message });
  }
};

/**
 * Transferencia entre dos cuentas
 */
export const transfer = async (req, res) => {
  const { fromAccountId, toAccountId, amount } = req.body;
  try {
    const [from, to] = await Promise.all([
      Account.findById(fromAccountId),
      Account.findById(toAccountId),
    ]);
    if (!from || !to || !from.status || !to.status) {
      return res.status(404).json({ success: false, message: 'Alguna de las cuentas no existe o está inactiva' });
    }
    if (from.balance < amount) {
      return res.status(400).json({ success: false, message: 'Fondos insuficientes' });
    }
    // Ajustar saldos
    from.balance -= amount;
    to.balance += amount;
    await Promise.all([from.save(), to.save()]);
    // Crear ambas transacciones
    const txnOut = await Transaction.create({
      account: fromAccountId,
      type: 'TRANSFERENCIA',
      amount,
      relatedAccount: toAccountId,
    });
    const txnIn = await Transaction.create({
      account: toAccountId,
      type: 'TRANSFERENCIA',
      amount,
      relatedAccount: fromAccountId,
    });
    res.status(201).json({
      success: true,
      transactions: { out: txnOut, in: txnIn },
      balances: { from: from.balance, to: to.balance }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al procesar transferencia', error: err.message });
  }
};

/**
 * Compra: descuenta del saldo y registra como COMPRA
 */
export const purchase = async (req, res) => {
  const { accountId, amount } = req.body;
  try {
    const acct = await Account.findById(accountId);
    if (!acct || !acct.status) {
      return res.status(404).json({ success: false, message: 'Cuenta no encontrada o inactiva' });
    }
    if (acct.balance < amount) {
      return res.status(400).json({ success: false, message: 'Fondos insuficientes para la compra' });
    }
    acct.balance -= amount;
    await acct.save();
    const txn = await Transaction.create({
      account: accountId,
      type: 'COMPRA',
      amount,
    });
    res.status(201).json({ success: true, transaction: txn, balance: acct.balance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al procesar compra', error: err.message });
  }
};

/**
 * Crédito: abona al saldo y registra como CREDITO
 */
export const credit = async (req, res) => {
  const { accountId, amount } = req.body;
  try {
    const acct = await Account.findById(accountId);
    if (!acct || !acct.status) {
      return res.status(404).json({ success: false, message: 'Cuenta no encontrada o inactiva' });
    }
    acct.balance += amount;
    await acct.save();
    const txn = await Transaction.create({
      account: accountId,
      type: 'CREDITO',
      amount,
    });
    res.status(201).json({ success: true, transaction: txn, balance: acct.balance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al procesar crédito', error: err.message });
  }
};

/**
 * Actualizar una transacción (campos: type, amount, relatedAccount o reversed)
 */
export const updateTransaction = async (req, res) => {
  const { id } = req.params;
  const updates = (({ type, amount, relatedAccount, reversed }) => ({
    type, amount, relatedAccount, reversed
  }))(req.body);
  try {
    const txn = await Transaction.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    });
    if (!txn) {
      return res.status(404).json({ success: false, message: 'Transacción no encontrada' });
    }
    res.status(200).json({ success: true, transaction: txn });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al actualizar la transacción', error: err.message });
  }
};

/**
 * Eliminar una transacción (borrado físico)
 */
export const deleteTransaction = async (req, res) => {
  const { id } = req.params;
  try {
    const txn = await Transaction.findByIdAndDelete(id);
    if (!txn) {
      return res.status(404).json({ success: false, message: 'Transacción no encontrada' });
    }
    res.status(200).json({ success: true, message: 'Transacción eliminada', transaction: txn });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al eliminar la transacción', error: err.message });
  }
};
