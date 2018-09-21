const CDN_VERSION = '0.0.4';

const CDN_BASE_URL = `//cdn.jsdelivr.net/npm/ezedox_pdfjs@${CDN_VERSION}`;

const EZEDOX_CONSTANTS = {
  workerSrc: `${CDN_BASE_URL}/build/generic/build/pdf.worker.js`,
  cMapUrl: `${CDN_BASE_URL}/build/generic/web/cmaps/`,
  defaultUrl: '',
  showPreviousViewOnLoad: false,
  defaultZoomValue: 'auto',
};

export default EZEDOX_CONSTANTS;
