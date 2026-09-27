// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

import { TextDecoder, TextEncoder } from 'util';

// Polyfill TextEncoder and TextDecoder for Node.js
global.TextEncoder = TextEncoder as typeof globalThis.TextEncoder;
global.TextDecoder = TextDecoder as typeof globalThis.TextDecoder;
