'use client';
import withAuth from '../components/AuthGuard/AuthGuard'
import Header from '../components/Header/Header';

function Excluded() {
  return (
    <div style={{ color: 'black'}}>
        <Header />
        excluidas
    </div>
  )
}

export default withAuth(Excluded)
