// Auth configuration
// Password hash of 'HouseKonigsmark' (SHA-256)
// To change the password, generate a new SHA-256 hash and update this value.
// You can generate one at: https://emn178.github.io/online-tools/sha256.html
const AUTH_CONFIG = {
    // SHA-256 hash of 'HouseKonigsmark'
    passwordHash: 'afe99c8850c5217dedc8051409c2afd120d290397ddc97d6d0302818662a9982',
    sessionKey: 'gg_auth_session'
};

async function computeSHA256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(inputPassword) {
    const hash = await computeSHA256(inputPassword);
    return hash === AUTH_CONFIG.passwordHash;
}

function isAuthenticated() {
    return sessionStorage.getItem(AUTH_CONFIG.sessionKey) === 'true';
}

function setAuthenticated() {
    sessionStorage.setItem(AUTH_CONFIG.sessionKey, 'true');
}

function logout() {
    sessionStorage.removeItem(AUTH_CONFIG.sessionKey);
    location.reload();
}
