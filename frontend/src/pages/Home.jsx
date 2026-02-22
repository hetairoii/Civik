// src/pages/Home.jsx
import React from 'react';
import { Hero } from '../components/Hero';
import { CardsContainer } from '../components/CardsContainer';

export const Home = () => {
    return (
        <>
            <Hero />
            <CardsContainer />
        </>
    );
};