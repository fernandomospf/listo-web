'use client';
import withAuth from '../components/AuthGuard/AuthGuard'
import Header from '../components/Header/Header';

function Completed() {
  return (
    <div style={{color: 'black'}}>
      <Header/>
        completed
    </div>
  )
}

export default withAuth(Completed)
