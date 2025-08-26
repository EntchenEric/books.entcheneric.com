import '@testing-library/jest-dom';
import 'whatwg-fetch'
require("dotenv").config({ path: ".env.test" })
require('jest-fetch-mock').enableMocks();

global.ResizeObserver = class ResizeObserver {
    observe() {
    }
    unobserve() {
    }
    disconnect() {
    }
};
