import { RouterProvider, createBrowserRouter, Navigate } from "react-router-dom";
import { Layout } from './Pages/Layout';
import { AnimatedLayout, PAGE_SLIDER_ANIMATION_END_EVENT_NAME } from './Pages/AnimatedLayout';
import { Home } from './Pages/Home';
import { Users } from './Pages/Users';
import { Patients } from './Pages/Patients';
import { Visits } from './Pages/Visits';
import { General } from './Pages/Settings/General';
import { DbSettings } from './Pages/Settings/DbSettings';
import { ThemeSettings } from './Pages/Settings/ThemeSettings';
import { MedicalHistories } from "./Pages/MedicalHistories";
import { useMemo } from "react";
import { publish } from "./Lib/Events";

export function Main() {
    console.log('Main')

    const general = useMemo(() => <General />, [])
    const dbSettings = useMemo(() => <DbSettings />, [])
    const themeSettings = useMemo(() => <ThemeSettings />, [])
    const home = useMemo(() => <Home />, [])
    const users = useMemo(() => <Users />, [])
    const patients = useMemo(() => <Patients />, [])
    const visits = useMemo(() => <Visits />, [])
    const medicalHistories = useMemo(() => <MedicalHistories />, [])

    const shouldAnimateLayout = false

    const router = createBrowserRouter([
        {
            path: '/',
            element: <Layout />,
            errorElement: <Navigate to="/" replace={true} />,
            children: [
                {
                    index: true,
                    path: "/",
                    element: shouldAnimateLayout ? <AnimatedLayout>{home}</AnimatedLayout> : home
                },
                {
                    path: "/Users",
                    element: shouldAnimateLayout ? <AnimatedLayout>{users}</AnimatedLayout> : users
                },
                {
                    path: "/Patients",
                    element: shouldAnimateLayout ? <AnimatedLayout>{patients}</AnimatedLayout> : patients
                },
                {
                    path: "/Visits",
                    element: shouldAnimateLayout ? <AnimatedLayout>{visits}</AnimatedLayout> : visits
                },
                {
                    path: "/MedicalHistories",
                    element: shouldAnimateLayout ? <AnimatedLayout>{medicalHistories}</AnimatedLayout> : medicalHistories
                },
                {
                    path: "/General",
                    element: shouldAnimateLayout ? <AnimatedLayout>{general}</AnimatedLayout> : general
                },
                {
                    path: "/DbSettings",
                    element: shouldAnimateLayout ? <AnimatedLayout>{dbSettings}</AnimatedLayout> : dbSettings
                },
                {
                    path: "/ThemeSettings",
                    element: shouldAnimateLayout ? <AnimatedLayout>{themeSettings}</AnimatedLayout> : themeSettings
                },
            ]
        }
    ]);

    return (<RouterProvider router={router} />)
}


