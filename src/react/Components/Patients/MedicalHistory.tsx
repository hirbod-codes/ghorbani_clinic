import { t } from "i18next";
import { useState, useMemo, useContext, useEffect } from 'react'
import { PatientsMedicalHistory } from "../../../Electron/Database/Models/Patient";
import { Editor } from "../Base/Editor/Editor";
import { Modal } from "../Base/Modal";
import { MedicalHistorySearch } from "../MedicalHistory/MedicalHistorySearch";
import { resources } from "../../../Electron/Database/Repositories/Auth/resources";
import { AuthContext } from "../../Contexts/AuthContext";
import { Separator } from "../../shadcn/components/ui/separator";
import { Button } from "../../Components/Base/Button";
import { Tooltip } from "../Base/Tooltip";
import { EditIcon } from "lucide-react";
import { Stack } from "../Base/Stack";

export type MedicalHistoryProps = {
    open: boolean;
    onClose?: () => void;
    inputMedicalHistory?: PatientsMedicalHistory | undefined;
    onDone?: (medicalHistory: PatientsMedicalHistory) => any;
    onChange?: (medicalHistory: PatientsMedicalHistory) => any;
}

export function MedicalHistory({ open, onDone, onClose, inputMedicalHistory, onChange }: MedicalHistoryProps) {
    const auth = useContext(AuthContext)
    const [openDrawer, setOpenDrawer] = useState<boolean>(false)
    const [medicalHistory, setMedicalHistory] = useState<PatientsMedicalHistory | undefined>(inputMedicalHistory)

    const [isEditingHistories, setIsEditingHistories] = useState<boolean>(false)

    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

    console.log('MedicalHistory', { openDrawer, medicalHistory, hasUnsavedChanges, inputMedicalHistory })

    const initDialog: any = {
        open: false,
        title: '',
        content: '',
        dialog: () => { }
    }
    const [dialog, setDialog] = useState(initDialog)
    const closeDialog = () => setDialog(initDialog)

    const updateMedicalHistory = useMemo(() => auth?.user && auth?.accessControl && auth?.accessControl.can(auth?.user.roleName).update(resources.MEDICAL_HISTORY).granted, [auth])

    useEffect(() => {
        setMedicalHistory(inputMedicalHistory)
    }, [inputMedicalHistory])

    return (
        <>
            <Modal
                onClose={() => {
                    if (hasUnsavedChanges)
                        setDialog({
                            open: true,
                            title: t('MedicalHistories.exiting'),
                            content: t('MedicalHistories.areYouSure?YouHaveUnsavedChanges'),
                            action: () => {
                                setHasUnsavedChanges(false)
                                if (onClose) onClose()
                            }
                        })
                    else if (onClose)
                        onClose()
                }}
                open={open}
                modalContainerProps={{ style: { minWidth: '80%', minHeight: '70%' } }}
            >
                <Stack direction="vertical" stackProps={{ className: "size-full justify-end" }}>
                    <div className="w-full flex-grow p-2">
                        <Stack stackProps={{ className: "size-full justify-between" }}>
                            <div className="flex-grow shadow-md max-w-[48%] h-full p-3">
                                <Stack direction='vertical' stackProps={{ className: "size-full" }}>
                                    <div className="flex flex-row justify-between items-center">
                                        <div className="w-full overflow-auto text-nowrap">
                                            <h6>
                                                {t('MedicalHistories.medicalHistory')}
                                            </h6>
                                        </div>

                                        {updateMedicalHistory &&
                                            // using div component because alignItems='start' will make dividers invisible!!
                                            <Tooltip tooltipContent={t('MedicalHistories.Edit')}>
                                                <Button isIcon variant="text" onClick={() => setIsEditingHistories(true)}>
                                                    <EditIcon />
                                                </Button>
                                            </Tooltip>
                                        }
                                    </div>

                                    <Separator />

                                    <Stack direction='vertical' stackProps={{ className: "overflow-auto flex-grow" }}>
                                        {medicalHistory?.histories?.map((h, i) =>
                                            <p key={i}>
                                                {h}
                                            </p>
                                        )}
                                    </Stack>
                                </Stack>
                            </div>

                            <Separator orientation="vertical" />

                            <div className="max-w-[48%] h-full flex-grow p-3 shadow-md">
                                <Editor
                                    title={t('MedicalHistories.medicalHistory')}
                                    hideCanvas={!updateMedicalHistory}
                                    hideTextEditor={!updateMedicalHistory}
                                    text={medicalHistory?.description?.text}
                                    canvasId={medicalHistory?.description?.canvas as string}
                                    onSave={(text, canvas) => {
                                        setMedicalHistory({ ...medicalHistory, description: { text, canvas } });
                                        if (onChange)
                                            onChange({ ...medicalHistory, description: { text, canvas } })
                                    }}
                                    onChange={(text, canvas) => {
                                        if (onChange)
                                            onChange({ ...medicalHistory, description: { text, canvas } })
                                    }}
                                    setHasUnsavedChanges={(b) => { if (b === true) setHasUnsavedChanges(b) }}
                                />
                            </div>
                        </Stack>
                    </div>

                    <Separator />

                    <Button variant='outline' onClick={async () => {
                        if (onDone)
                            await onDone(medicalHistory)
                        setHasUnsavedChanges(false)
                    }}>
                        {t('MedicalHistories.save')}
                    </Button>
                </Stack>
            </Modal >

            <Modal
                open={isEditingHistories}
                closeButton={false}
                modalContainerProps={{ style: { minWidth: '80%', minHeight: '70%' } }}
            >
                <MedicalHistorySearch
                    deletable
                    creatable
                    selectable
                    selection={medicalHistory?.histories}
                    onDone={(s) => {
                        setHasUnsavedChanges(true)
                        setMedicalHistory({ ...medicalHistory, histories: s })
                        setIsEditingHistories(false)
                    }}
                    onCancel={() => {
                        setIsEditingHistories(false)
                    }}

                />
            </Modal>

            <Modal
                open={dialog.open}
                onClose={closeDialog}
            >
                {dialog.content}

                <Stack>
                    <Button onClick={closeDialog}>{t('MedicalHistories.No')}</Button>
                    <Button onClick={() => {
                        if (dialog.action)
                            dialog.action()

                        closeDialog()
                    }}>{t('MedicalHistories.Yes')}</Button>
                </Stack>
            </Modal>
        </>
    )
}

