import './globals.css';

export const metadata = {
  title: 'PinMe - GitHub Pinned Repo SVG Generator',
  description: 'Generate SVGs that mimic GitHub pinned repositories for your README',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
