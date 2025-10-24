import { Login } from "./components/Login/Login";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)' }}>
      <main>
          <Login />
      </main>
    </div>
  );
}
