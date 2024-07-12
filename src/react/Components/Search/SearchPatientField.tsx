import { useContext, useState, ChangeEvent } from "react";
import { t } from "i18next";
import { CircularProgress, InputAdornment, Modal, Paper, Slide, TextField } from "@mui/material";
import { RendererDbAPI } from "../../../Electron/Database/handleDbRendererEvents";
import { SearchOutlined } from "@mui/icons-material";
import { Patient } from "../../../Electron/Database/Models/Patient";
import { ManagePatient } from "../Patients/ManagePatient";
import { RESULT_EVENT_NAME } from "../../Contexts/ResultWrapper";
import { publish } from "../../Lib/Events";


export function SearchPatientField() {
    const [loading, setLoading] = useState<boolean>(false);
    const [socialId, setSocialId] = useState<string | undefined>(undefined);
    const [patient, setPatient] = useState<Patient | undefined>(undefined);

    console.log('SearchPatientField', { loading, socialId, patient });

    const onSocialIdChange = async (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (Number.isNaN(e.target.value))
            return;

        if (e.target.value && e.target.value.trim().length <= 10)
            setSocialId(e.target.value);

        if (!e.target.value || e.target.value.trim().length !== 10)
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

        setPatient(res.data);
    };

    return (
        <>
            <TextField
                fullWidth
                label={t('search')}
                type="text"
                variant="standard"
                value={socialId ?? ''}
                onChange={onSocialIdChange}
                error={socialId !== undefined && socialId.length !== 10}
                helperText={socialId !== undefined && socialId.length !== 10 ? t('InvalidSocialId') : (!loading && socialId && socialId.length === 10 && !patient ? t('patientNotFound') : '')}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            {loading ? <CircularProgress size={20} /> : <SearchOutlined />}
                        </InputAdornment>
                    ),
                }} />

            <ManagePatient
                open={patient !== undefined}
                onClose={() => { setPatient(undefined); setSocialId(undefined) }}
                inputPatient={patient}
            />
        </>
    );
}
