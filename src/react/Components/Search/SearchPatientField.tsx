import { useState, ChangeEvent, memo } from "react";
import { t } from "i18next";
import { CircularProgress, InputAdornment, TextField } from "@mui/material";
import { RendererDbAPI } from "../../../Electron/Database/renderer";
import { SearchOutlined } from "@mui/icons-material";
import { Patient } from "../../../Electron/Database/Models/Patient";
import { ManagePatient } from "../Patients/ManagePatient";
import { RESULT_EVENT_NAME } from "../../Contexts/ResultWrapper";
import { publish } from "../../Lib/Events";

export const SearchPatientField = memo(function SearchPatientField() {
    const [loading, setLoading] = useState<boolean>(false);
    const [socialId, setSocialId] = useState<string | undefined>(undefined);
    const [patient, setPatient] = useState<Patient | undefined>(undefined);

    console.log('SearchPatientField', { loading, socialId, patient });

    const onSocialIdChange = async (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (e.target.value.trim().length > 10 || e.target.value.trim().match(/\D+/)?.length > 0)
            return;

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

        setPatient(res.data);
    };

    return (
        <>
            <TextField
                fullWidth
                label={t('SearchPatientField.search')}
                type="text"
                variant="standard"
                value={socialId ?? ''}
                placeholder={t('SearchPatientField.socialId')}
                onChange={onSocialIdChange}
                error={socialId !== undefined && socialId.length !== 0 && socialId.length !== 10}
                helperText={socialId !== undefined && socialId.length !== 0 && socialId.length !== 10 ? t('SearchPatientField.InvalidSocialId') : (!loading && socialId && socialId.length === 10 && !patient ? t('SearchPatientField.patientNotFound') : '')}
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
})
