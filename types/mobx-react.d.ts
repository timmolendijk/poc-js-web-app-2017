import 'mobx-react';

declare module 'mobx-react' {
  export function inject<P>(...stores: string[]): <TFunction extends React.StatelessComponent<P>>(target: TFunction) => TFunction; // decorator signature
  export function inject<T, P>(storesToProps : (stores: any, nextProps: P, context:any) => T): <TFunction extends React.StatelessComponent<T | P>>(target: TFunction) => TFunction; // decorator
  export function useStaticRendering(value: boolean);
}
