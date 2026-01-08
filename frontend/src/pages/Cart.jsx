import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Nav from '../components/Nav.jsx';
import Chatbot from '../components/Chatbot.jsx';

function Cart() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const list = JSON.parse(localStorage.getItem('cartItems') || '[]');
      setItems(Array.isArray(list) ? list : []);
    } catch {
      setItems([]);
    }
  }, []);

  const totalCount = useMemo(() => items.reduce((sum, it) => sum + Number(it.quantity || 1), 0), [items]);
  const totalPrice = useMemo(() => items.reduce((sum, it) => sum + Number(it.price || 0) * Number(it.quantity || 1), 0), [items]);

  const save = (next) => {
    setItems(next);
    localStorage.setItem('cartItems', JSON.stringify(next));
    const total = next.reduce((sum, it) => sum + Number(it.quantity || 1), 0);
    localStorage.setItem('cartCount', String(total));
    window.dispatchEvent(new Event('cart:update'));
  };

  const changeQty = (id, kind, delta) => {
    const next = items.map(it => {
      if (String(it.id) === String(id) && it.kind === kind) {
        const q = Math.max(1, Number(it.quantity || 1) + delta);
        return { ...it, quantity: q };
      }
      return it;
    });
    save(next);
  };

  const removeItem = (id, kind) => {
    const next = items.filter(it => !(String(it.id) === String(id) && it.kind === kind));
    save(next);
  };

  const checkout = () => {
    if (items.length === 0) return;
    alert('Checkout successful');
    save([]);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Nav />
      <Chatbot />
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-slate-900">Your Cart</h1>
        <p className="text-sm text-slate-600 mt-1">{totalCount} item(s)</p>

        {items.length === 0 ? (
          <div className="mt-8 bg-white border border-slate-200 rounded-xl p-6 text-center">
            <p className="text-slate-700">Your cart is empty.</p>
            <Link to="/packages" className="inline-block mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg">Browse Packages</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2 space-y-4">
              {items.map(it => (
                <div key={`${it.kind}-${it.id}`} className="bg-white border border-slate-200 rounded-xl p-4 flex gap-4">
                  <div className="w-24 h-24 bg-slate-100 rounded-lg overflow-hidden">
                    {it.imageUrl ? <img src={it.imageUrl} alt={it.title} className="w-full h-full object-cover" /> : null}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900">{it.title}</h3>
                        <p className="text-sm text-slate-500">{it.city}{it.country ? `, ${it.country}` : ''}</p>
                      </div>
                      <button onClick={() => removeItem(it.id, it.kind)} className="text-rose-600 text-sm">Remove</button>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button onClick={() => changeQty(it.id, it.kind, -1)} className="px-2 py-1 rounded border border-slate-300">-</button>
                        <span className="px-3 py-1 rounded bg-slate-100">{it.quantity || 1}</span>
                        <button onClick={() => changeQty(it.id, it.kind, 1)} className="px-2 py-1 rounded border border-slate-300">+</button>
                      </div>
                      <div className="text-slate-900 font-semibold">${Number(it.price || 0) * Number(it.quantity || 1)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 h-fit">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-bold text-slate-900">${totalPrice}</span>
              </div>
              <button onClick={checkout} className="mt-4 w-full px-4 py-2 bg-indigo-600 text-white rounded-lg">Checkout</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
