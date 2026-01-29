// import Navbar from "@/components/layout/Test";
import Navbar from "@/components/layout/Test";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        <Navbar user={{ first_name: "John", last_name: "Doe", email: "john.doe@example.com", role: "STUDENT" }} />
        {children}
      </body>
    </html>
  );
}