import Login from "./(page)/loging.jsx";

export const metadata = {
  title: "Login - Farmers Fertilizer",
  description: "Secure login to access the Farmers Fertilizer Management System",
};

export default function Home() {
  return (
    <main className="min-h-screen">
      <Login />
    </main>
  );
}