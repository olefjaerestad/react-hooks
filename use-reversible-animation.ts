import { MutableRefObject, useCallback, useRef } from 'react';
import { isDefined } from '../../common/utils/type-guards';

type AnimatableElement = Element | null | undefined;

/**
 * Returns the following:
 * - `animate`: A function to animate given elements with the given keyframes
 *   and options. Returns the provided id or a randomly generated string id.
 *   Use the returned id in the `reverse` function.
 * - `reverse`: A function to reverse a previously run animation. An animation
 *   can only be reversed once pr. 'normal direction' animation. Use the id
 *   returned from `animate` to decide which animation to reverse.
 * - The count of how many animations have run without being reversed.
 *
 * @example
 *
 * const [animate, reverseAnimate, animationCount] = useReversibleAnimation(
 *   [
 *     {
 *       opacity: 1,
 *     },
 *     {
 *       opacity: 0,
 *     },
 *   ],
 *   {
 *     duration: 200,
 *     fill: 'forwards',
 *     easing: 'ease-out',
 *   }
 * );
 *
 * // Somewhere else in your component
 * const animationId = animate('some-unique-id', [document.getElementById('my-el'), document.getElementById('my-el-2')]);
 * reverseAnimate(animationId);
 * console.info(animationCount.current);
 */
export function useReversibleAnimation(
  keyframes:
    | Keyframe[]
    | ((
        element: AnimatableElement,
        elements: AnimatableElement[]
      ) => Keyframe[]),
  options: KeyframeAnimationOptions
): [
  animate: (
    id: string,
    elements: AnimatableElement[] | (() => AnimatableElement[])
  ) => string,
  reverse: (id: string) => void,
  animationsCount: MutableRefObject<number>
] {
  /** One array of animations per `animate` call. */
  const animations = useRef<Record<string, (Animation | undefined)[]>>({});
  /** How many animations have run without being reversed. */
  const animationsCount = useRef<number>(0);

  const animate = useCallback(
    (
      id: string | null,
      elements: AnimatableElement[] | (() => AnimatableElement[])
    ) => {
      const els = typeof elements === 'function' ? elements() : elements;
      id = id !== null ? id : Date.now().toString() + Math.random().toString();

      animations.current[id] = els.map((el) =>
        el?.animate(
          typeof keyframes === 'function' ? keyframes(el, els) : keyframes,
          options
        )
      );

      animationsCount.current++;

      return id;
    },
    [keyframes, options]
  );

  const reverse = useCallback((id: string) => {
    animations.current[id]
      ?.filter(isDefined)
      .forEach((animation) => animation.reverse());

    delete animations.current[id];
    animationsCount.current--;
  }, []);

  return [animate, reverse, animationsCount];
}
