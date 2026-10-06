import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// unmount rendered components after every test
afterEach(() => cleanup());
