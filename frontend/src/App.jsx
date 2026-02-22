import { useState } from 'react'
import './App.css'
import {Hero} from './components/Hero';
import {CardsContainer} from './components/CardsContainer';

function App() {
  return (
    <>
      <main className='bg-brand-beige flex justify-center'>
        <section className='border-2 color-red-500 w-[296px] my-[80px]'>
          <Hero />
          <CardsContainer />
        </section>
      </main>
    </>
  )
}

export default App
