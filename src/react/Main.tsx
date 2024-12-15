import { RouterProvider, createBrowserRouter, Navigate } from "react-router-dom";
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

    const router = createBrowserRouter([
        {
            path: '/',
            element: <Layout />,
            // errorElement: <Navigate to="/" replace={true} />,
            children: [
                {
                    index: true,
                    path: "/",
                    element: <AnimatedLayout>{home}</AnimatedLayout>
                },
                {
                    path: "/Users",
                    element: <AnimatedLayout>{users}</AnimatedLayout>
                },
                {
                    path: "/Patients",
                    element: <AnimatedLayout>{patients}</AnimatedLayout>
                },
                {
                    path: "/Visits",
                    element: <AnimatedLayout>{visits}</AnimatedLayout>
                },
                {
                    path: "/MedicalHistories",
                    element: <AnimatedLayout>{medicalHistories}</AnimatedLayout>
                },
                {
                    path: "/General",
                    element: <AnimatedLayout>{general}</AnimatedLayout>
                },
                {
                    path: "/DbSettings",
                    element: <AnimatedLayout>{dbSettings}</AnimatedLayout>
                },
                {
                    path: "/ThemeSettings",
                    element: <AnimatedLayout>{themeSettings}</AnimatedLayout>
                },
            ]
        }
    ]);

    return (<RouterProvider router={router} />)
}


