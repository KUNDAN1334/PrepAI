import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /**
   * Keep these packages out of the server bundle.
   * - mongoose: pulls in optional native/dynamic requires that break when bundled.
   * - pdfjs-dist: lib/resume-parser.ts resolves its worker file from node_modules
   *   at runtime, which only works if the package is not inlined.
   */
  serverExternalPackages: ['mongoose', 'pdfjs-dist'],
};

export default nextConfig;
