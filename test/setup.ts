import { expect, vi } from "vitest";
import "@testing-library/jest-dom/vitest";

// Make test functions globally available
globalThis.describe = describe;
globalThis.it = it;
globalThis.expect = expect;
globalThis.vi = vi;