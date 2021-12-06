import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders home page", () => {
  render(<App />);
  const linkElement = screen.getByText(/liste des affaires/i);
  expect(linkElement).toBeInTheDocument();
});
