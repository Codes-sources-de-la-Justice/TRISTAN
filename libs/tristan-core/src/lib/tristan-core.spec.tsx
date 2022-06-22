import { render } from '@testing-library/react';

import TristanCore from './tristan-core';

describe('TristanCore', () => {
  it('should render successfully', () => {
    const { baseElement } = render(< TristanCore />);
    expect(baseElement).toBeTruthy();
  });
});
