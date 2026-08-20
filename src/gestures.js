/* Touch / mouse gesture handling */
class GestureSystem {
  constructor() {
    this.hammer = null;
    this.initHammer();
  }

  initHammer() {
    if (window.Hammer) {
      this.hammer = new Hammer.Manager(document.querySelector('.app'));
      this.hammer.add(new Hammer.Pan({ threshold: 10, direction: Hammer.DIRECTION_ALL }));
      this.hammer.add(new Hammer.Swipe({ direction: Hammer.DIRECTION_HORIZONTAL }));
      this.hammer.add(new Hammer.Tap({ taps: 1 }));
      this.hammer.add(new Hammer.Press({ time: 500 }));
    } else {
      this.addNativeGestures();
    }
  }

  addNativeGestures() {
    const container = document.querySelector('.app');

    /* Simple touch gesture detection without Hammer.js */
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;

    container.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        touchStartTime = Date.now();
      }
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
      if (Date.now() - touchStartTime > 500) return;

      const touch = e.changedTouches[0];
      if (!touch) return;

      const touchEndX = touch.clientX;
      const touchEndY = touch.clientY;
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;
      const deltaTime = Date.now() - touchStartTime;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      /* Distinguish tap from swipe */
      if (deltaTime < 300 && distance < 20) {
        const target = e.target.closest('[data-gesture="tap"]') || e.target.closest('.gift-box, .envelope');
        if (target) {
          target.dispatchEvent(new CustomEvent('gesturetap'));
        }
      }

      if (deltaTime < 500 && distance > 40) {
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
          const swipeEvent = new CustomEvent('swipe', {
            detail: {
              direction: deltaX > 0 ? 'right' : 'left',
              velocity: distance / deltaTime
            }
          });
          container.dispatchEvent(swipeEvent);
        }
      }
    }, { passive: true });

    /* Mouse event fallbacks */
    let mouseDown = false;
    let mouseDownX = 0;
    let mouseDownY = 0;

    container.addEventListener('mousedown', (e) => {
      mouseDown = true;
      mouseDownX = e.clientX;
      mouseDownY = e.clientY;
      touchStartTime = Date.now();
    });

    container.addEventListener('mouseup', (e) => {
      if (!mouseDown) return;
      mouseDown = false;

      if (Date.now() - touchStartTime > 500) return;

      const deltaX = e.clientX - mouseDownX;
      const deltaY = e.clientY - mouseDownY;
      const deltaTime = Date.now() - touchStartTime;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      const target = e.target.closest('.gift-box, .envelope');
      if (target && distance < 10) {
        target.dispatchEvent(new CustomEvent('gesturetap'));
      }

      if (deltaTime < 500 && distance > 40 && Math.abs(deltaX) > 30) {
        const swipeEvent = new CustomEvent('swipe', {
          detail: {
            direction: deltaX > 0 ? 'right' : 'left',
          }
        });
        container.dispatchEvent(swipeEvent);
      }
    });

    container.addEventListener('click', (e) => {
      const target = e.target.closest('.gift-box, .envelope');
      if (target && !mouseDown) {
        target.dispatchEvent(new CustomEvent('gesturetap'));
      }
    });
  }

  onSwipe(callback) {
    const container = document.querySelector('.app');
    container.addEventListener('swipe', callback);
  }

  onTap(selector, callback) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      el.addEventListener('gesturetap', callback);
      el.style.cursor = 'pointer';
    });
  }

  /* Detect long press / hold for "blow candles" */
  onHold(selector, callback, holdDuration = 1500) {
    const elements = document.querySelectorAll(selector);
    let pressTimer = null;
    let isHolding = false;

    const startHold = () => {
      isHolding = true;
      pressTimer = setTimeout(() => {
        callback();
      }, holdDuration);
    };

    const cancelHold = () => {
      isHolding = false;
      if (pressTimer) {
        clearTimeout(pressTimer);
        pressTimer = null;
      }
    };

    elements.forEach(el => {
      el.addEventListener('mousedown', startHold);
      el.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) startHold();
      }, { passive: true });
      el.addEventListener('mouseup', cancelHold);
      el.addEventListener('mouseleave', cancelHold);
      el.addEventListener('touchend', cancelHold);
      el.addEventListener('touchcancel', cancelHold);
    });
  }

  vibrate(pattern) {
    if (navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {}
    }
  }
}

const Gestures = new GestureSystem();
window.Gestures = Gestures;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Gestures, GestureSystem };
}
