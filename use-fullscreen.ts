import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type IRequestFullscreenFn = (el: HTMLElement, options?: FullscreenOptions) => Promise<void>;
type IExitFullscreenFn = () => Promise<void>;

const FULLSCREEN_STYLES: Partial<Omit<CSSStyleDeclaration, 'length' | 'parentRule'>> = {
  objectFit: 'contain',
  userSelect: 'text',
  position: 'fixed',
  top: '0px',
  right: '0px',
  bottom: '0px',
  left: '0px',
  boxSizing: 'border-box',
  minWidth: '0px',
  maxWidth: 'none',
  minHeight: '0px',
  maxHeight: 'none',
  width: '100%',
  height: '100%',
  transform: 'none',
  margin: '0px',
  zIndex: '99999999',
  overscrollBehavior: 'none',
};

function addFullscreenStyles(el: HTMLElement) {
  Object.entries(FULLSCREEN_STYLES).forEach(([property, value]) => {
    (el.style[property as keyof typeof FULLSCREEN_STYLES] as string) = value as string;
  });
}

function removeFullscreenStyles(el: HTMLElement) {
  Object.entries(FULLSCREEN_STYLES).forEach(([property]) => {
    (el.style[property as keyof typeof FULLSCREEN_STYLES] as string) = '';
  });
}

function addFullscreenClass(el: HTMLElement) {
  el.classList.add('useFullscreen');
}

function removeFullscreenClass(el: HTMLElement) {
  el.classList.remove('useFullscreen');
}

/**
 * Display overflow on all ancestor elements of the provided `el`.
 *
 * When using fixed positioning to display a child element outside it's parent
 * on iOS, the parent must display it's overflow in order for the child to be
 * fully displayed.
 *
 * Use together with `hideOverflowIOSFix`.
 *
 * @see https://stackoverflow.com/q/52060027
 */
function showOverflowIOSFix(el: HTMLElement) {
  while (el.parentElement) {
    if (el.parentElement.style.overflowX !== 'visible') {
      el.parentElement.dataset.originalOverflowX = el.parentElement.style.overflowX;
      el.parentElement.style.overflowX = 'visible';
    }
    if (el.parentElement.style.overflowY !== 'visible') {
      el.parentElement.dataset.originalOverflowY = el.parentElement.style.overflowY;
      el.parentElement.style.overflowY = 'visible';
    }
    el = el.parentElement;
  }
}

/**
 * Reset overflow on all ancestor elements of the provided `el`.
 *
 * Use together with `showOverflowIOSFix`.
 */
function hideOverflowIOSFix(el: HTMLElement) {
  while (el.parentElement) {
    if (typeof el.parentElement.dataset.originalOverflowX === 'string') {
      el.parentElement.style.overflowX = el.parentElement.dataset.originalOverflowX;
      delete el.parentElement.dataset.originalOverflowX;
    }
    if (typeof el.parentElement.dataset.originalOverflowY === 'string') {
      el.parentElement.style.overflowY = el.parentElement.dataset.originalOverflowY;
      delete el.parentElement.dataset.originalOverflowY;
    }
    el = el.parentElement;
  }
}

/**
 * Get cross-browser compatible `requestFullscreen` and `exitFullscreen` functions.
 * Uses native Fullscreen API if supported, and fallbacks to a custom implementation.
 *
 * Takes an optional `orientation` argument. If provided, the site will
 * automatically be rotated (if necessary) when entering fullscreen. The support
 * for this is limited by the browser support for `ScreenOrientation.lock`. This
 * also fixes a chromium bug where certain HTML elements (especially those
 * positioned outside of normal flow) would be placed behind browser UI when
 * exiting fullscreen mode.
 *
 * If the native Fullscreen API is used, you can style the fullscreen element
 * with the `:fullscreen` CSS pseudo class. In addition, a `.useFullscreen` CSS
 * class is always added to the fullscreen element, so that can also be used for
 * styling (keep in mind most CSS selectors are non-forgiving).
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API
 * @see https://developer.mozilla.org/en-US/docs/Web/API/ScreenOrientation/lock
 * @see https://bugs.chromium.org/p/chromium/issues/detail?id=497543
 *
 * @example
 *
 * const { exitFullscreen, isFullscreen, requestFullscreen } = useFullscreen();
 * const ref = useRef<HTMLDivElement>(null);
 *
 * function enterExitFullscreen() {
 *   if (isFullscreen) {
 *     exitFullscreen().catch((err) => {
 *       console.error(err)
 *     });
 *   } else {
 *     if (!!ref.current) {
 *       requestFullscreen(ref.current).catch((err) => {
 *         console.error(err)
 *       });
 *     }
 *   }
 * }
 *
 * <div ref={ref}>I can go fullscreen</div>
 * <button onClick={enterExitFullscreen}>Go fullscreen</button>
 */
export function useFullscreen(orientation?: OrientationLockType): {
  exitFullscreen: IExitFullscreenFn;
  isFullscreen: boolean;
  requestFullscreen: IRequestFullscreenFn;
} {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const fullscreenElement = useRef<HTMLElement>();
  // @ts-ignore: Property 'webkitFullscreenEnabled' does not exist on type 'Document'.
  const fullscreenEnabled = document.fullscreenEnabled || document.webkitFullscreenEnabled;

  const exitFullscreenNative: IExitFullscreenFn = useCallback(async () => {
    // @ts-ignore: Property 'webkitExitFullscreen' does not exist on type 'Document'.
    const exit = document.exitFullscreen || document.webkitExitFullscreen;

    screen?.orientation?.unlock?.();
    await exit.call(document);
    if (fullscreenElement.current) removeFullscreenClass(fullscreenElement.current);
    fullscreenElement.current = undefined;
    setIsFullscreen(false);
  }, []);

  const exitFullscreenCustom: IExitFullscreenFn = useCallback(async () => {
    if (fullscreenElement.current) {
      removeFullscreenStyles(fullscreenElement.current);
      removeFullscreenClass(fullscreenElement.current);
      hideOverflowIOSFix(fullscreenElement.current);
    }
    fullscreenElement.current = undefined;
    setIsFullscreen(false);
  }, []);

  const exitFullscreen: IExitFullscreenFn = useMemo(() => {
    return fullscreenEnabled ? exitFullscreenNative : exitFullscreenCustom;
  }, [exitFullscreenCustom, exitFullscreenNative, fullscreenEnabled]);

  const requestFullscreenNative: IRequestFullscreenFn = useCallback(
    async (el: HTMLElement, options?: FullscreenOptions) => {
      // @ts-ignore: Property 'webkitRequestFullscreen' does not exist on type 'HTMLElement'.
      const request = el?.requestFullscreen || el?.webkitRequestFullscreen;

      await request.call(el, options);
      if (orientation !== undefined) {
        await screen?.orientation?.lock?.(orientation).catch(() => {
          /* noop */
        });
      }
      addFullscreenClass(el);
      fullscreenElement.current = el;
      setIsFullscreen(true);
    },
    [orientation]
  );

  const requestFullscreenCustom: IRequestFullscreenFn = useCallback(
    async (el: HTMLElement, options?: FullscreenOptions) => {
      addFullscreenStyles(el);
      addFullscreenClass(el);
      showOverflowIOSFix(el);
      fullscreenElement.current = el;
      setIsFullscreen(true);
    },
    []
  );

  const requestFullscreen: IRequestFullscreenFn = useMemo(() => {
    return fullscreenEnabled ? requestFullscreenNative : requestFullscreenCustom;
  }, [fullscreenEnabled, requestFullscreenCustom, requestFullscreenNative]);

  useEffect(() => {
    function handleFullscreenChange(e: Event) {
      const isFullscreen: boolean =
        !!document.fullscreenElement ||
        // @ts-ignore: Property does not exist on type 'Document'.
        !!document.webkitFullscreenElement ||
        // @ts-ignore: Property does not exist on type 'Document'.
        !!document.mozFullScreenElement ||
        // @ts-ignore: Property does not exist on type 'Document'.
        !!document.msFullscreenElement ||
        document.fullscreen ||
        // @ts-ignore: Property does not exist on type 'Document'.
        document.webkitIsFullScreen;

      if (!isFullscreen) {
        if (fullscreenElement.current) removeFullscreenClass(fullscreenElement.current);
        fullscreenElement.current = undefined;
        setIsFullscreen(false);
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return { exitFullscreen, isFullscreen, requestFullscreen };
}
