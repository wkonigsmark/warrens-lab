// Dynasty Soccer — coach mode (PIN gate). The PIN is verified server-side by
// every coach_* function; here we only remember it for the browser session.
import { rpc } from './db.js';

const KEY = 'dynasty-soccer:pin';
const listeners = new Set();

export function getPin() { try { return sessionStorage.getItem(KEY) || ''; } catch { return ''; } }
export function isUnlocked() { return !!getPin(); }
export function onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }
function emit() { for (const fn of listeners) fn(isUnlocked()); }

export async function unlock(pin) {
  await rpc('coach_verify_pin', { pin });
  try { sessionStorage.setItem(KEY, pin); } catch {}
  emit();
}
export function lock() {
  try { sessionStorage.removeItem(KEY); } catch {}
  emit();
}

/** Call a coach_* RPC with the stored PIN. A rejected PIN locks coach mode. */
export async function coachCall(name, args = {}) {
  try {
    return await rpc(name, { pin: getPin(), ...args });
  } catch (err) {
    if (err.message === 'invalid_pin') lock();
    throw err;
  }
}

/** Render the lock/unlock control into `el`. */
export function mountCoachToggle(el) {
  function draw() {
    if (isUnlocked()) {
      el.innerHTML = `<span class="coach-badge">Coach mode</span><button class="chip" data-act="lock">Lock</button>`;
    } else {
      el.innerHTML = `<button class="chip" data-act="open">Coach mode</button>`;
    }
  }
  el.addEventListener('click', e => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'lock') { lock(); draw(); }
    if (act === 'open') {
      el.innerHTML = `
        <form class="pin-form">
          <input type="password" inputmode="numeric" pattern="[0-9]*" autocomplete="off" placeholder="PIN" aria-label="Coach PIN" autofocus>
          <button class="chip on" type="submit">Unlock</button>
          <button class="chip" type="button" data-act="cancel">Cancel</button>
          <span class="pin-msg"></span>
        </form>`;
      el.querySelector('input').focus();
    }
    if (act === 'cancel') draw();
  });
  el.addEventListener('submit', async e => {
    e.preventDefault();
    const input = el.querySelector('input'), msg = el.querySelector('.pin-msg');
    msg.textContent = '…';
    try { await unlock(input.value.trim()); draw(); }
    catch (err) { msg.textContent = err.message === 'invalid_pin' ? 'Wrong PIN' : err.message; input.select(); }
  });
  onChange(draw);
  draw();
}
