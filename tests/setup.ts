import "@testing-library/jest-dom/vitest";
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
afterAll(() => server.close());

class IntersectionObserverMock {
  callback: IntersectionObserverCallback;
  elements: Element[] = [];

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }

  observe = (element: Element) => {
    this.elements.push(element);
    const entries: IntersectionObserverEntry[] = [
      { isIntersecting: true, target: element } as IntersectionObserverEntry
    ];
    this.callback(entries, this as unknown as IntersectionObserver);
  };

  unobserve = () => {};
  disconnect = () => {};
}

Object.defineProperty(global, 'IntersectionObserver', {
  writable: true,
  value: IntersectionObserverMock,
});

window.scrollTo = () => {};