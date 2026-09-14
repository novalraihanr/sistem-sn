import "../styles/globals.css";

export const metadata = {
  title: "Dashboard",
  description: "SN Cargo",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
