import type { Patient } from "../../../Electron/Database/Models/Patient";

export function ShowPatient({ patient }: { patient: Patient | null }) {
    if (patient === null)
        return (<>{null}</>)

    return (
        <>
            <h1>Show patient</h1>
        </>
    )
}