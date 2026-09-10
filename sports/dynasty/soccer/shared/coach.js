// Dynasty Soccer — coach mode (PIN gate). The PIN is verified server-side by
// every coach_* function; here we only remember it for the browser session.
import { rpc } from './db.js';

const KEY = 'dynasty-soccer:pin';
const PIN_LENGTH = 4;          // auto-submits once this many digits are entered
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
          <input type="password" inputmode="numeric" pattern="[0-9]*" maxlength="${PIN_LENGTH}"
                 autocomplete="off" placeholder="PIN" aria-label="Coach PIN" autofocus>
          <button class="chip" type="button" data-act="cancel">Cancel</button>
          <span class="pin-msg"></span>
        </form>`;
      el.querySelector('input').focus();
    }
    if (act === 'cancel') draw();
  });
  let checking = false;
  async function trySubmit() {
    const input = el.querySelector('input');
    const msg = el.querySelector('.pin-msg');
    if (!input || checking) return;
    checking = true;
    input.disabled = true;
    msg.textContent = 'Checking…';
    msg.classList.remove('bad');
    try {
      await unlock(input.value.trim());
      draw();                                  // unlocked: the form is replaced
    } catch (err) {
      msg.textContent = err.message === 'invalid_pin' ? 'Wrong PIN' : err.message;
      msg.classList.add('bad');
      input.disabled = false;
      input.value = '';                        // clear so the next digit starts fresh
      input.focus();
    } finally {
      checking = false;
    }
  }

  // Digits only, and unlock the moment the PIN is complete — no second tap.
  el.addEventListener('input', e => {
    if (!e.target.matches('.pin-form input')) return;
    const digits = e.target.value.replace(/\D/g, '').slice(0, PIN_LENGTH);
    if (digits !== e.target.value) e.target.value = digits;
    const msg = el.querySelector('.pin-msg');
    if (msg && msg.classList.contains('bad')) { msg.textContent = ''; msg.classList.remove('bad'); }
    if (digits.length === PIN_LENGTH) trySubmit();
  });

  el.addEventListener('submit', e => { e.preventDefault(); trySubmit(); });
  onChange(draw);
  draw();
}
