import { RouterProvider, Navigate, createHashRouter, } from "react-router-dom";
import { Layout } from './Pages/Layout';
import { AnimatedLayout } from './Pages/AnimatedLayout';
import { Home } from './Pages/Home';
import { Users } from './Pages/Users';
import { Patients } from './Pages/Patients';
import { Visits } from './Pages/Visits';
import { General } from './Pages/Settings/General';
import { DbSettings } from './Pages/Settings/DbSettings';
import { ThemeSettings } from './Pages/Settings/ThemeSettings';
import { MedicalHistories } from "./Pages/MedicalHistories";
import { useMemo } from "react";
import { Error } from "./Pages/Error";

export function Main() {
    console.log('Main')

    const error = useMemo(() => <Error />, [])
    const general = useMemo(() => <General />, [])
    const dbSettings = useMemo(() => <DbSettings />, [])
    const themeSettings = useMemo(() => <ThemeSettings />, [])
    const home = useMemo(() => <Home />, [])
    const users = useMemo(() => <Users />, [])
    const patients = useMemo(() => <Patients />, [])
    const visits = useMemo(() => <Visits />, [])
    const medicalHistories = useMemo(() => <MedicalHistories />, [])

    const shouldAnimateLayout = false

    const router = createHashRouter([
        {
            path: '/',
            element: <Layout />,
            errorElement: <Navigate to="/error" replace={true} />,
            children: [
                {
                    index: true,
                    path: "/",
                    element: shouldAnimateLayout ? <AnimatedLayout>{home}</AnimatedLayout> : home
                },
                {
                    path: "/error",
                    element: shouldAnimateLayout ? <AnimatedLayout>{error}</AnimatedLayout> : error
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
        },
        {
            path: '*',
            element: <Navigate to="/error" replace={true} />,
            errorElement: <Navigate to="/error" replace={true} />,
        }
    ]);

    return (<RouterProvider router={router} />)
}


