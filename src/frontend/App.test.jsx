import { render, screen } from "@testing-library/react";
import React from 'react';
import App from "./App";

test("renders home page", () => {
  render(<App />);
	expect(screen.queryAllByText(/liste des affaires/i).length).toBeGreaterThan(0);
});
