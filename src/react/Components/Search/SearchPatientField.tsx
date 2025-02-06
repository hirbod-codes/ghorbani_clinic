import { useState, ChangeEvent, memo, useMemo, useContext } from "react";
import { t } from "i18next";
import { RendererDbAPI } from "../../../Electron/Database/renderer";
import { Patient } from "../../../Electron/Database/Models/Patient";
import { ManagePatientModal } from "../Patients/ManagePatientModal";
import { RESULT_EVENT_NAME } from "../../Contexts/ResultWrapper";
import { publish } from "../../Lib/Events";
import { Input } from "../Base/Input";
import { CircularLoadingIcon } from "../Base/CircularLoadingIcon";
import { SearchIcon } from "lucide-react";
import { AuthContext } from "../../Contexts/AuthContext";
import { Button } from "../Base/Button";
import { resources } from "@/src/Electron/Database/Repositories/Auth/resources";

export const SearchPatientField = memo(function SearchPatientField() {
    const auth = useContext(AuthContext)

    const [open, setOpen] = useState<boolean>(false);

    const [loading, setLoading] = useState<boolean>(false);
    const [socialId, setSocialId] = useState<string | undefined>(undefined);
    const [patient, setPatient] = useState<Patient | undefined>(undefined);

    let errorText = socialId !== undefined && socialId.length !== 0 && socialId.length !== 10 ? t('SearchPatientField.InvalidSocialId') : (!loading && socialId && socialId.length === 10 && !patient ? t('SearchPatientField.patientNotFound') : undefined)

    console.log('SearchPatientField', { loading, socialId, patient });

    const onSocialIdChange = async (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (e.target.value.trim().length > 10 || (e.target.value.trim().match(/\D+/)?.length ?? 0) > 0)
            return

        setSocialId(e.target.value.trim());

        if (!e.target.value || Number.isNaN(e.target.value.trim()) || e.target.value.trim().length !== 10)
            return;

        setLoading(true);
        const res = await (window as typeof window & { dbAPI: RendererDbAPI; }).dbAPI.getPatient(e.target.value);
        setLoading(false);

        if (res.code !== 200 || !res.data)
            return;

        publish(RESULT_EVENT_NAME, {
            severity: 'success',
            message: t('foundPatient')
        });

        setPatient(res.data)
        if (res.data !== undefined)
            setOpen(true)
    };

    const readsPatient = useMemo(() => auth?.user && auth?.accessControl && auth?.accessControl.can(auth?.user.roleName).read(resources.PATIENT).granted, [auth])
    const createsPatient = useMemo(() => auth?.user && auth?.accessControl && auth?.accessControl.can(auth?.user.roleName).create(resources.PATIENT).granted, [auth])
    const updatesPatient = useMemo(() => auth?.user && auth?.accessControl && auth?.accessControl.can(auth?.user.roleName).update(resources.PATIENT).granted, [auth])

    if (readsPatient !== true && createsPatient !== true && updatesPatient !== true)
        return

    return (
        <>
            <Input
                value={socialId ?? ''}
                placeholder={t('SearchPatientField.socialId')}
                onChange={onSocialIdChange}
                errorText={errorText}
                animateHeight
                startIcon={loading ? <CircularLoadingIcon /> : <SearchIcon />}
                className={createsPatient ? 'pl-[1cm] pr-[2cm]' : undefined}
                endIcon={
                    createsPatient ?
                        <Button
                            bgColor="success"
                            fgColor='success-foreground'
                            className="h-full border-0"
                            onClick={() => setOpen(true)}
                        >
                            +{t('SearchPatientField.Create')}
                        </Button>
                        : undefined
                }
                endIconProps={{ className: 'right-[1px] h-[calc(100%-2px)] border-0' }}
            />

            <ManagePatientModal
                open={open}
                onClose={() => { setPatient(undefined); setSocialId(undefined); setOpen(false) }}
                inputPatient={patient}
            />
        </>
    );
})
