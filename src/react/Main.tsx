import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from './Pages/Layout';
import { AnimatedLayout } from './Pages/AnimatedLayout';
import { Home } from './Pages/Home';
import { Users } from './Pages/Users';
import { Patients } from './Pages/Patients';
import { Visits } from './Pages/Visits';
import { General } from './Pages/Settings/General';
import { DbSettings } from './Pages/Settings/DbSettings';
import { ThemeSettings } from './Pages/Settings/ThemeSettings';

export function Main() {
    console.log('Main')

    return (
        <>
            <BrowserRouter>
                <Routes location={'/'}>
                    <Route path="/" element={<Layout />} >
                        <Route path="/" element={<AnimatedLayout><Home /></AnimatedLayout>} />
                        <Route path="/Users" element={<AnimatedLayout><Users /></AnimatedLayout>} />
                        <Route path="/Patients" element={<AnimatedLayout><Patients /></AnimatedLayout>} />
                        <Route path="/Visits" element={<AnimatedLayout><Visits /></AnimatedLayout>} />
                        <Route path="/General" element={<AnimatedLayout><General /></AnimatedLayout>} />
                        <Route path="/DbSettings" element={<AnimatedLayout><DbSettings /></AnimatedLayout>} />
                        <Route path="/ThemeSettings" element={<AnimatedLayout><ThemeSettings /></AnimatedLayout>} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </>
    )
}


