import React, { useState, useEffect } from "react";
import "/style.css";
import { backend } from "declarations/backend";

export default function App() {
  const [tokens, setTokens] = useState([]);
  const [form, setForm] = useState({ name: "", symbol: "", initialSupply: 0 });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    loadTokens();
  }, []);

  async function loadTokens() {
    const allTokens = await backend.getAllTokens();
    setTokens(allTokens);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: name === "initialSupply" ? Number(value) : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (editId === null) {
      if (form.name && form.symbol) {
        await backend.addToken(form.name, form.symbol, form.initialSupply);
      }
    } else {
      await backend.updateToken(editId, form.name, form.symbol, form.initialSupply);
    }
    setForm({ name: "", symbol: "", initialSupply: 0 });
    setEditId(null);
    loadTokens();
  }

  function handleEdit(token) {
    setEditId(token.id);
    setForm({
      name: token.name,
      symbol: token.symbol,
      initialSupply: Number(token.totalSupply || 0),
    });
  }

  async function handleDelete(id) {
    if (window.confirm("Are you sure you want to delete this token?")) {
      await backend.deleteToken(id);
      loadTokens();
    }
  }

  function handleCancel() {
    setEditId(null);
    setForm({ name: "", symbol: "", initialSupply: 0 });
  }

  return (
    <div className="app-container">
      <h1>Token Manager</h1>

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="tokenId">Token Name</label>
            <input
              id="tokenId"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="tokenValue">Symbol</label>
            <input
              id="tokenValue"
              name="symbol"
              type="text"
              value={form.symbol}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="supply">Initial Supply</label>
            <input
              id="supply"
              name="initialSupply"
              type="number"
              value={form.initialSupply}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="form-actions">
          <button type="submit">{editId === null ? "Add Token" : "Update"}</button>
          {editId !== null && <button type="button" onClick={handleCancel}>Cancel</button>}
        </div>
      </form>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Symbol</th>
            <th>Supply</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((token) => (
            <tr key={token.id.toString()}>
              <td>{token.name}</td>
              <td>{token.symbol}</td>
              <td>{token.totalSupply ? token.totalSupply.toString() : "0"}</td>
              <td>
                <div className="action-buttons">
                  <button onClick={() => handleEdit(token)}>Edit</button>
                  <button onClick={() => handleDelete(token.id)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
