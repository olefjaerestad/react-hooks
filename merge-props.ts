/**
 * Merge props. Returns the merged props.
 * Code borrowed from https://github.com/navikt/aksel/blob/main/%40navikt/core/react/src/slot/merge-props.ts
 * and modified slightly.
 */
function mergeProps(
  props: Record<string, unknown>,
  overrideProps: Record<string, unknown>
) {
  // all child props should override
  const override = { ...overrideProps };

  for (const propName in overrideProps) {
    const propValue = props[propName];
    const overridePropValue = overrideProps[propName];
    const isHandler = /^on[A-Z]/.test(propName);

    if (isHandler) {
      // if the handler exists on both, we compose them
      if (
        typeof propValue === 'function' &&
        typeof overridePropValue === 'function'
      ) {
        override[propName] = (...args: unknown[]) => {
          overridePropValue(...args);
          propValue(...args);
        };
      }
      // but if it exists only on the slot, we use only this one
      else if (propValue) {
        override[propName] = propValue;
      }
    }
    // if it's `style`, we merge them
    else if (propName === 'style') {
      override[propName] = {
        ...(propValue as Record<string, unknown> | undefined),
        ...(overridePropValue as Record<string, unknown> | undefined),
      };
    } else if (propName === 'className') {
      override[propName] = [propValue, overridePropValue]
        .filter(Boolean)
        .join(' ');
    }
  }

  return { ...props, ...override };
}

export { mergeProps };
