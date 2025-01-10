import { t } from "i18next";
import { useContext, useEffect, useMemo, useState } from "react";
import { MedicalHistory } from "../../../Electron/Database/Models/MedicalHistory";
import { RendererDbAPI } from "../../../Electron/Database/renderer";
import { TrashIcon } from "../Icons/TrashIcon";
import { AuthContext } from "../../Contexts/AuthContext";
import { resources } from "../../../Electron/Database/Repositories/Auth/resources";
import { publish } from "../../Lib/Events";
import { RESULT_EVENT_NAME } from "../../Contexts/ResultWrapper";
import { EditorModal } from "../Base/Editor/EditorModal";
import { AnimatedList } from "../Animations/AnimatedList";
import { Input } from "../Base/Input";
import { CircularLoading } from "../Base/CircularLoading";
import { Button } from "../../Components/Base/Button";
import { CheckIcon, PlusIcon, SearchIcon } from "lucide-react";
import { Switch } from "../Base/Switch";
import { Separator } from "../../shadcn/components/ui/separator";
import { Modal } from "../Base/Modal";
import { ConfigurationContext } from "../../Contexts/Configuration/ConfigurationContext";

export function MedicalHistorySearch({ creatable = false, deletable = false, defaultSelection, selectable = false, onSelectionChange }: { creatable?: boolean, deletable?: boolean, defaultSelection?: string[], selectable?: boolean, onSelectionChange?: (selection: string[]) => (void | Promise<void>) }) {
    const themeOptions = useContext(ConfigurationContext)!.themeOptions
    const auth = useContext(AuthContext)

    const initDialog: any = {
        open: false,
        title: '',
        content: '',
        action: null
    }
    const [dialog, setDialog] = useState<{
        open: boolean,
        title?: string,
        content: string,
        action: () => void | Promise<void>
    }>(initDialog)
    const closeDialog = () => setDialog(initDialog)

    const [creatingMedicalHistory, setCreatingMedicalHistory] = useState(false)

    const [searchStr, setSearchStr] = useState<string>('')
    const [medicalHistories, setMedicalHistories] = useState<MedicalHistory[]>([])

    const [isSearching, setIsSearching] = useState<boolean>(false)

    const search = async () => {
        setIsSearching(true)

        const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.searchMedicalHistories(searchStr)
        console.log({ res })

        if (res.code !== 200 || !res.data)
            return false

        setIsSearching(false)

        setMedicalHistories(res.data)

        return true
    }

    const createsMedicalHistory = useMemo(() => auth?.user && auth?.accessControl && auth?.accessControl.can(auth?.user.roleName).create(resources.MEDICAL_HISTORY), [auth])
    const deletesMedicalHistory = useMemo(() => auth?.user && auth?.accessControl && auth?.accessControl.can(auth?.user.roleName).delete(resources.MEDICAL_HISTORY), [auth])

    const deleteMedicalHistory = async (id: string) =>
        setDialog({
            open: true,
            content: t('MedicalHistories.deleteMedicalHistoryDialogContent'),
            action: async () => {
                try {
                    console.group('MedicalHistories', 'deletesMedicalHistory', 'onClick', id)

                    const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.deleteMedicalHistoryById(id)
                    console.log({ res })

                    if (res.code !== 200 || !res.data || !res.data.acknowledged || res.data.deletedCount !== 1) {
                        publish(RESULT_EVENT_NAME, {
                            severity: 'error',
                            message: t('MedicalHistories.failedToDeleteMedicalHistory')
                        })
                        return
                    }

                    await search()
                }
                catch (err) { console.error(err) }
                finally { console.groupEnd() }
            }
        })

    const [selection, setSelection] = useState(defaultSelection ?? [])

    useEffect(() => {
        if (onSelectionChange)
            onSelectionChange(selection)
    }, [selection])

    return (
        <>
            <div className='flex flex-col justify-start items-center w-full h-full space-x-2 space-y-2'>
                <div className='flex flex-row items-center'>
                    <Input
                        value={searchStr}
                        onChange={(e) => setSearchStr(e.target.value)}
                        label={t('MedicalHistorySearch.search')}
                        labelId={t('MedicalHistorySearch.search')}
                        startIcon={<SearchIcon />}
                    />

                    {isSearching
                        ? <CircularLoading />
                        : <Button onClick={search}>
                            <CheckIcon />
                        </Button>
                    }
                </div>

                <div className='flex-grow overflow-hidden w-full'>
                    <div className="flex flex-col justify-between h-full w-full">
                        <div className='h-full w-full p-2 overflow-auto shadow-md'>
                            <AnimatedList
                                collection={medicalHistories.map((md, i) => ({
                                    key: md.name,
                                    elm:
                                        <div className='flex flex-row items-center justify-between space-x-2 space-y-2 w-full'>
                                            {selectable === true &&
                                                <Switch checked={selection?.find(f => f === md.name) !== undefined} onCheckedChange={(v) => setSelection((old) => {
                                                    if (old.find(f => f === md.name) !== undefined)
                                                        return old.filter(f => f !== md.name)
                                                    else
                                                        return [...old, md.name]
                                                })} />
                                            }
                                            <p className="overflow-auto">
                                                {md.name}
                                            </p>
                                            {deletesMedicalHistory && deletable &&
                                                <Button onClick={() => deleteMedicalHistory(md._id as string)}>
                                                    <TrashIcon color={themeOptions.colors.destructive} />
                                                </Button>
                                            }
                                        </div>
                                }))}
                                withDelay={true}
                            />
                        </div>

                        <Separator />

                        {selectable &&
                            <div className="h-[48%] w-full p-2 overflow-auto shadow-md">
                                <AnimatedList
                                    collection={selection.map((name, i) => ({
                                        key: name,
                                        elm:
                                            <div className="flex flex-row items-center justify-between space-x-2 space-y-2 w-full">
                                                <p className="overflow-auto">
                                                    {name}
                                                </p>

                                                <Button onClick={() => setSelection(selection.filter(f => f !== name))}>
                                                    <TrashIcon color={themeOptions.colors.destructive} />
                                                </Button>
                                            </div>
                                    }))}
                                    withDelay={true}
                                />
                            </div>
                        }
                    </div>
                </div>

                {createsMedicalHistory && creatable &&
                    <Button onClick={() => setCreatingMedicalHistory(true)} color="success">
                        <PlusIcon />
                    </Button>
                }
            </div >

            {/* Medical history creation, Name field */}
            < EditorModal
                open={creatingMedicalHistory}
                onClose={() => setCreatingMedicalHistory(false)
                }
                hideCanvas={true}
                title={t('MedicalHistories.creationModalTitle')}
                onSave={async (mh, canvasId) => {
                    try {
                        console.group('MedicalHistories', 'Address', 'onSave')
                        console.log({ address: mh, canvasId })

                        if (!mh)
                            return

                        const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.createMedicalHistory({ name: mh })
                        console.log({ res })
                        if (res.code !== 200 || !res.data || !res.data.acknowledged) {
                            publish(RESULT_EVENT_NAME, {
                                severity: 'error',
                                message: t('MedicalHistories.failedToUpdatePatientAddress')
                            })

                            return
                        }

                        publish(RESULT_EVENT_NAME, {
                            severity: 'success',
                            message: t('MedicalHistories.successfullyUpdatedPatientAddress')
                        })

                        await search()
                    }
                    finally { console.groupEnd() }
                }}
            />

            <Modal
                open={dialog.open}
                onClose={closeDialog}
                title={dialog.title}
                footer={<>
                    <Button onClick={closeDialog}>{t('MedicalHistories.No')}</Button>
                    <Button onClick={async () => {
                        if (dialog.action)
                            await dialog.action()
                        closeDialog()
                    }}>
                        {t('MedicalHistories.Yes')}
                    </Button>
                </>}
            >
                {dialog.content}
            </Modal>
        </>
    )
}

