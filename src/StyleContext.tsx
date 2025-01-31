import * as React from 'react';
import CacheEntity from './Cache';

export const ATTR_TOKEN = 'data-token-hash';
export const ATTR_MARK = 'data-css-hash';

export function createCache() {
  if (typeof document !== 'undefined') {
    const styles = document.body.querySelectorAll(`style[${ATTR_MARK}]`);

    Array.from(styles).forEach((style) => {
      document.head.appendChild(style);
    });

    // Deduplicate of moved styles
    const styleHash: Record<string, boolean> = {};
    Array.from(document.querySelectorAll(`style[${ATTR_MARK}]`)).forEach(
      (style) => {
        const hash = style.getAttribute(ATTR_MARK)!;
        if (styleHash[hash]) {
          style.parentNode?.removeChild(style);
        } else {
          styleHash[hash] = true;
        }
      },
    );
  }

  return new CacheEntity();
}

export interface StyleContextProps {
  autoClear?: boolean;
  /** @private Test only. Not work in production. */
  mock?: 'server' | 'client';
  /**
   * Only set when you need ssr to extract style on you own.
   * If not provided, it will auto create <style /> on the end of Provider in server side.
   */
  cache: CacheEntity;
  /** Tell children that this context is default generated context */
  defaultCache: boolean;
}

const StyleContext = React.createContext<StyleContextProps>({
  cache: createCache(),
  defaultCache: true,
});

export type StyleProviderProps = Partial<StyleContextProps>;

export const StyleProvider: React.FC<StyleProviderProps> = (props) => {
  const { autoClear, mock, cache, children } = props;
  const {
    cache: parentCache,
    autoClear: parentAutoClear,
    mock: parentMock,
    defaultCache: parentDefaultCache,
  } = React.useContext(StyleContext);

  const context = React.useMemo<StyleContextProps>(
    () => ({
      autoClear: autoClear ?? parentAutoClear,
      mock: mock ?? parentMock,
      cache: cache || parentCache || createCache(),
      defaultCache: !cache && parentDefaultCache,
    }),
    [
      autoClear,
      parentAutoClear,
      parentMock,
      parentCache,
      mock,
      cache,
      parentDefaultCache,
    ],
  );

  return (
    <StyleContext.Provider value={context}>{children}</StyleContext.Provider>
  );
};

export default StyleContext;
