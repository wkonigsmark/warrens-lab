/* =============================================
   JourneyBridge — the integration contract.

   Drop this script onto any activity that wants to
   participate in Journey. When the page is opened
   via the runner, JourneyBridge.isActive() is true
   and the activity should call complete() at game-over.

   The runner reads the result from localStorage and
   navigates back. Activities do not need to know
   anything else about the runner.

   Usage inside an activity (e.g. games/foursight):

       <script src="/journey/bridge.js"></script>
       <script>
         // ...your game code...
         function onGameOver(finalScore, maxScore) {
           if (window.JourneyBridge.isActive()) {
             JourneyBridge.complete({
               score:    finalScore,
               max:      maxScore,
               level:    JourneyBridge.getContext().level,
               // timeMs is optional — runner has its own fallback timer
               timeMs:   performance.now() - gameStartedAt
             });
           }
         }
       </script>
   ============================================= */
(() => {
  'use strict';

  const STORAGE_RESULT = 'journey:lastResult';

  function parseCtx() {
    const p = new URLSearchParams(location.search);
    if (p.get('journey') !== '1') return null;
    return {
      jid:        p.get('jid'),
      stopId:     p.get('stopId'),
      stopIndex:  Number(p.get('stopIndex')) || 0,
      level:      Number(p.get('level')) || 1,
      target:     Number(p.get('target')) || 0,
      childName:  p.get('childName') || '',
      returnTo:   p.get('returnTo') || '/journey/?resume=1'
    };
  }

  const ctx = parseCtx();

  window.JourneyBridge = {
    /** True if the activity was launched by the journey runner. */
    isActive() { return ctx !== null; },

    /** Read-only context for sizing difficulty, greeting by name, etc. */
    getContext() { return ctx ? { ...ctx } : null; },

    /**
     * Report the round result and hand control back to the runner.
     * result = { score, max, level?, timeMs?, notes? }
     */
    complete(result) {
      if (!ctx) {
        console.warn('[JourneyBridge] complete() called outside journey mode — ignored.');
        return;
      }
      const payload = {
        jid:       ctx.jid,
        stopId:    ctx.stopId,
        stopIndex: ctx.stopIndex,
        score:     Number(result?.score ?? 0),
        max:       Number(result?.max ?? ctx.target ?? 0),
        level:     Number(result?.level ?? ctx.level),
        timeMs:    Number(result?.timeMs ?? 0) || undefined,
        notes:     String(result?.notes || ''),
        finishedAt: Date.now()
      };

      // Iframe mode: the runner is our parent — message it directly.
      // This is the primary path now that the runner uses an iframe wrapper.
      if (window.parent && window.parent !== window) {
        try {
          window.parent.postMessage(
            { source: 'journey-bridge', type: 'complete', payload },
            location.origin
          );
          return;
        } catch (e) { /* fall through to legacy path */ }
      }

      // Legacy top-level mode: persist result and redirect back.
      try {
        localStorage.setItem(STORAGE_RESULT, JSON.stringify(payload));
      } catch (e) {
        console.error('[JourneyBridge] failed to persist result', e);
      }
      window.location.href = ctx.returnTo;
    },

    /** Optional: announce a banner so kids know they're in journey mode. */
    showBanner(text) {
      if (!ctx || document.getElementById('journey-banner')) return;
      const b = document.createElement('div');
      b.id = 'journey-banner';
      b.textContent = text || `Journey mode — ${ctx.childName}, stop ${ctx.stopIndex + 1}`;
      Object.assign(b.style, {
        position: 'fixed', top: '0', left: '0', right: '0',
        padding: '6px 12px',
        background: '#1a1c20', color: '#ffc454',
        fontFamily: 'Outfit, system-ui, sans-serif',
        fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase',
        textAlign: 'center', zIndex: 99999, fontWeight: '600'
      });
      document.body.appendChild(b);
    }
  };

  // Auto-banner only when running top-level. In iframe mode the runner's
  // own topbar already shows the journey context, so a second banner would
  // be redundant noise inside the game viewport.
  const isFramed = window.parent && window.parent !== window;
  if (ctx && !isFramed) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => window.JourneyBridge.showBanner());
    } else {
      window.JourneyBridge.showBanner();
    }
  }
})();
