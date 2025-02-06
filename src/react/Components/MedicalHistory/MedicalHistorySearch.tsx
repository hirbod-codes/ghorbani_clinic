import { t } from "i18next";
import { memo, useContext, useEffect, useMemo, useState } from "react";
import { MedicalHistory } from "../../../Electron/Database/Models/MedicalHistory";
import { RendererDbAPI } from "../../../Electron/Database/renderer";
import { AuthContext } from "../../Contexts/AuthContext";
import { resources } from "../../../Electron/Database/Repositories/Auth/resources";
import { publish } from "../../Lib/Events";
import { RESULT_EVENT_NAME } from "../../Contexts/ResultWrapper";
import { EditorModal } from "../Base/Editor/EditorModal";
import { AnimatedList } from "../Animations/AnimatedList";
import { Input } from "../Base/Input";
import { CircularLoadingIcon } from "../Base/CircularLoadingIcon";
import { Button } from "../../Components/Base/Button";
import { CheckIcon, PlusIcon, SearchIcon, Trash2Icon } from "lucide-react";
import { Switch } from "../Base/Switch";
import { Separator } from "../../shadcn/components/ui/separator";
import { Modal } from "../Base/Modal";
import { Stack } from "../Base/Stack";

export const MedicalHistorySearch = memo(function MedicalHistorySearch({ creatable = false, deletable = false, selection: defaultSelection, selectable = false, onDone, onCancel }: { creatable?: boolean, deletable?: boolean, selection?: string[], selectable?: boolean, onDone?: (selection: string[]) => (void | Promise<void>), onCancel?: () => (void | Promise<void>) }) {
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
        if (defaultSelection)
            setSelection(defaultSelection)
    }, [defaultSelection])

    console.log('MedicalHistorySearch', { creatable, deletable, defaultSelection, selectable, creatingMedicalHistory, searchStr, medicalHistories, isSearching, selection });

    return (
        <>
            <Stack direction='vertical' stackProps={{ className: 'justify-start items-center size-full' }}>
                <Stack stackProps={{ className: 'items-center' }}>
                    <Input
                        value={searchStr}
                        onChange={(e) => setSearchStr(e.target.value)}
                        className={createsMedicalHistory && creatable ? 'pl-[1cm] pr-[2cm]' : undefined}
                        startIcon={isSearching ? <CircularLoadingIcon /> : <SearchIcon onClick={search} className="cursor-pointer" />}
                        endIcon={
                            createsMedicalHistory && creatable &&
                            <Button
                                bgColor="success"
                                fgColor='success-foreground'
                                className="h-full border-0"
                                onClick={() => setCreatingMedicalHistory(true)}
                            >
                                +{t('MedicalHistorySearch.Add')}
                            </Button>
                        }
                        endIconProps={{ className: 'right-[1px] h-[calc(100%-2px)] border-0' }}
                        onKeyDown={e => { if (e.code === 'Enter' || e.code === 'NumpadEnter') search() }}
                    />
                </Stack>

                <Stack direction='vertical' stackProps={{ className: 'justify-between flex-grow overflow-hidden size-full' }}>
                    <div className='h-full w-full p-2 overflow-auto shadow-md'>
                        <AnimatedList
                            collection={medicalHistories.map((md, i) => ({
                                key: md.name,
                                elm:
                                    <Stack stackProps={{ className: 'items-center justify-between w-full' }}>
                                        {selectable === true &&
                                            <Switch checked={selection?.find(f => f === md.name) !== undefined} onCheckedChange={(v) => {
                                                if (selection.find(f => f === md.name) !== undefined)
                                                    setSelection(selection.filter(f => f !== md.name))
                                                else
                                                    setSelection([...selection, md.name])
                                            }} />
                                        }
                                        <p className="overflow-auto">
                                            {md.name}
                                        </p>
                                        {deletesMedicalHistory && deletable &&
                                            <Button isIcon variant="text" fgColor="error" onClick={() => deleteMedicalHistory(md._id as string)}>
                                                <Trash2Icon />
                                            </Button>
                                        }
                                    </Stack>
                            }))}
                            withDelay={false}
                        />
                    </div>

                    <Separator />

                    {selectable &&
                        <div className="h-[48%] w-full p-2 overflow-auto shadow-md">
                            <AnimatedList
                                presenceMode="sync"
                                motionDivProps={{ transition: { ease: [0, 0.5, 0.5, 1] } }}
                                collection={selection.map((name, i) => ({
                                    key: name,
                                    elm:
                                        <Stack stackProps={{ className: 'items-center justify-between w-full' }}>
                                            <p className="overflow-auto">
                                                {name}
                                            </p>

                                            <Button isIcon variant='text' fgColor='error' onClick={() => setSelection(selection.filter(f => f !== name))}>
                                                <Trash2Icon />
                                            </Button>
                                        </Stack>
                                }))}
                                withDelay={false}
                            />
                        </div>
                    }
                </Stack>

                <Stack stackProps={{ className: 'w-full justify-around' }}>
                    <Button
                        bgColor='error'
                        fgColor='error-foreground'
                        onClick={() => {
                            if (onCancel)
                                onCancel()
                        }}
                    >
                        {t('MedicalHistorySearch.cancel')}

                    </Button>
                    <Button
                        onClick={() => {
                            if (onDone)
                                onDone(selection)
                        }}
                    >
                        {t('MedicalHistorySearch.done')}

                    </Button>
                </Stack>
            </Stack>

            {/* Medical history creation, Name field */}
            <EditorModal
                open={creatingMedicalHistory}
                onClose={() => setCreatingMedicalHistory(false)}
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
            >
                {dialog.content}

                <Stack>
                    <Button onClick={closeDialog}>{t('MedicalHistories.No')}</Button>
                    <Button onClick={async () => {
                        if (dialog.action)
                            await dialog.action()
                        closeDialog()
                    }}>
                        {t('MedicalHistories.Yes')}
                    </Button>
                </Stack>
            </Modal>
        </>
    )
})

