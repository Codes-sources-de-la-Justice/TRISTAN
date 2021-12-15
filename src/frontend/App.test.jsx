import * as React from 'react';
import { render } from '@testing-library/react';
import { expect } from 'chai';
import App from './App';

describe('<App>', () => {
  it('renders head of the homepage', () => {
    const { getAllByText } = render(<App />);
    const linkElements = getAllByText(/Liste des affaires/i);
		expect(linkElements.length).to.be.above(1);
		for (const linkElement of linkElements) {
			expect(document.body.contains(linkElement));
		}
  });
});
