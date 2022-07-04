import React, { ReactNode } from 'react'

import { StyleSheetManager, createGlobalStyle, ThemeProvider, DefaultTheme } from 'styled-components';
import { ErrorBoundary } from '../containers/GenericError'
import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    standalone: boolean;
  }
}

export type { DefaultTheme };

const GlobalStyle = createGlobalStyle`
  ${props => props.theme.standalone && 
  (`
    body, #root { height: 100vh; }
  `)}
`;

export function Layout({ theme, children, target }: { children: ReactNode, theme: DefaultTheme, target: HTMLElement }) {
  return (
    <ErrorBoundary>
      <StyleSheetManager target={target}>
      <ThemeProvider theme={theme}>
          <GlobalStyle />
          {children}
      </ThemeProvider>
      </StyleSheetManager>
    </ErrorBoundary>
  );
}
