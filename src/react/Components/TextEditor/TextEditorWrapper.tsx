// import { useState, useEffect, useRef, MutableRefObject } from 'react';
// import { Box, Divider, IconButton, Stack, Typography } from "@mui/material"

// import { TextEditor } from './TextEditor';
// import { DrawOutlined, RemoveRedEyeOutlined, SaveAltOutlined, TypeSpecimenOutlined } from '@mui/icons-material';
// import { Canvas } from '../Canvas/Canvas';
// import { t } from 'i18next';
// import { RendererDbAPI } from '../../../Electron/Database/handleDbRendererEvents';
// import { publish } from '../../Lib/Events';
// import { RESULT_EVENT_NAME } from '../../Contexts/ResultWrapper';

// export type TextEditorWrapperProps = {
//     title?: string;
//     defaultContent?: string | undefined;
//     defaultCanvas?: string;
//     canvasFileName?: string;
//     setHasUnsavedChanges?: (state: boolean) => void
//     onSave?: (content: string, canvasId?: string) => void | Promise<void>;
//     onChange?: () => void | Promise<void>;
// }

// export function TextEditorWrapper({ title, defaultContent, defaultCanvas, canvasFileName, onSave, onChange, setHasUnsavedChanges: setHasUnsavedChangesProperty }: TextEditorWrapperProps) {
//     const [content, setContent] = useState<string | undefined>(defaultContent)
//     const [status, setStatus] = useState<string>('showing')

//     const [contentHasUnsavedChanges, setContentHasUnsavedChangesState] = useState<boolean>(false)
//     const [canvasHasUnsavedChanges, setCanvasHasUnsavedChangesState] = useState<boolean>(false)

//     const setCanvasHasUnsavedChanges = (state: boolean) => {
//         setCanvasHasUnsavedChangesState(state)

//         if (setHasUnsavedChangesProperty)
//             if (state)
//                 setHasUnsavedChangesProperty(state)
//             else
//                 setHasUnsavedChangesProperty(contentHasUnsavedChanges)
//     }

//     const setContentHasUnsavedChanges = (state: boolean) => {
//         setContentHasUnsavedChangesState(state)

//         if (setHasUnsavedChangesProperty)
//             if (state)
//                 setHasUnsavedChangesProperty(state)
//             else
//                 setHasUnsavedChangesProperty(canvasHasUnsavedChanges)
//     }

//     const canvas = useRef<HTMLCanvasElement>()

//     console.log('TextEditorWrapper', { title, defaultContent, defaultCanvas, onSave, content, status, canvas: canvas.current })

//     useEffect(() => {
//         setContent(defaultContent);
//     }, [defaultContent])

//     const saveContent = async () => {
//         if (onSave)
//             await onSave(content, defaultCanvas)

//         setContentHasUnsavedChanges(false)
//     }
//     const saveCanvas = () => {
//         return new Promise<void>((resolve, reject) => {
//             canvas.current?.toBlob(async (b) => {
//                 const imageData = canvas.current?.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, canvas.current?.width, canvas.current?.height)
//                 const data = imageData.data.buffer

//                 const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.uploadCanvas(canvasFileName, { width: canvas.current?.width, height: canvas.current?.height, colorSpace: 'srgb', data })
//                 console.log('res', res)
//                 if (res.code !== 200 || !res.data) {
//                     publish(RESULT_EVENT_NAME, {
//                         severity: 'error',
//                         message: t('failedToUploadCanvas')
//                     })

//                     resolve()
//                     return
//                 }

//                 publish(RESULT_EVENT_NAME, {
//                     severity: 'success',
//                     message: t('successfullyUploadedCanvas')
//                 })

//                 defaultCanvas = res.data

//                 if (onSave)
//                     await onSave(content, res.data)

//                 setCanvasHasUnsavedChanges(false)
//                 resolve()
//             })
//         })
//     }

//     return (
//         <>
//             <Stack direction='column' spacing={1} sx={{ width: '100%', height: '100%' }}>
//                 <Stack direction='row' justifyContent='space-between' alignContent='center'>
//                     <Typography variant='h5'>
//                         {title}
//                     </Typography>
//                     <Stack direction='row' justifyContent='end' alignContent='center'>
//                         <IconButton onClick={() => setStatus('showing')}>
//                             <RemoveRedEyeOutlined />
//                         </IconButton>
//                         <IconButton onClick={() => setStatus('typing')}>
//                             <TypeSpecimenOutlined />
//                         </IconButton>
//                         {canvasFileName
//                             &&
//                             <IconButton onClick={() => setStatus('drawing')}>
//                                 <DrawOutlined />
//                             </IconButton>
//                         }
//                     </Stack>
//                 </Stack>

//                 <Divider />

//                 {status === 'showing'
//                     &&
//                     <Typography variant='body1'>
//                         {content}
//                     </Typography>
//                 }

//                 {status === 'typing'
//                     &&
//                     <>
//                         <Stack direction='row' justifyContent='start' alignContent='center'>
//                             <IconButton onClick={saveContent} color={contentHasUnsavedChanges ? 'warning' : 'default'}>
//                                 <SaveAltOutlined />
//                             </IconButton>
//                         </Stack>
//                         <TextEditor
//                             defaultContent={defaultContent}
//                             onChange={async (c) => {
//                                 setContentHasUnsavedChanges(true)
//                                 if (onChange)
//                                     await onChange()
//                             }}
//                         />
//                     </>
//                 }

//                 {
//                     canvasFileName && status === 'drawing'
//                     &&
//                     <>
//                         <Stack direction='row' justifyContent='start' alignContent='center'>
//                             <IconButton onClick={saveCanvas} color={canvasHasUnsavedChanges ? 'warning' : 'default'}>
//                                 <SaveAltOutlined />
//                             </IconButton>
//                         </Stack>

//                         <Box sx={{ flexGrow: 2, width: '100%', height: '100%' }}>
//                             <CanvasWrapper defaultCanvas={defaultCanvas} outRef={canvas} onChange={() => setCanvasHasUnsavedChanges(true)} />
//                         </Box>
//                     </>
//                 }

//             </Stack >
//         </>
//     )
// }

// function _arrayBufferToBase64(buffer: ArrayBuffer): string {
//     let binary = '';
//     new Uint8Array(buffer).forEach((b) => binary += String.fromCharCode(b))

//     return window.btoa(binary);
// }

// function CanvasWrapper({ defaultCanvas, outRef, onChange }: { defaultCanvas?: string, outRef?: MutableRefObject<HTMLCanvasElement>, onChange?: (empty?: boolean) => void | Promise<void> }) {
//     const canvas = useRef<HTMLCanvasElement>()

//     console.log('CanvasWrapper', { defaultCanvas, canvas: canvas.current })

//     const init = async () => {
//         console.log('CanvasWrapper', 'init', 'start')
//         if (!defaultCanvas) {
//             console.log('CanvasWrapper', 'init', 'end', 'no canvas')
//             return
//         }

//         if (!canvas.current) {
//             console.log('CanvasWrapper', 'init', 'end', 'no canvas ref')
//             return
//         }

//         const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.downloadCanvas(defaultCanvas)
//         console.log('res', res)
//         if (res.code !== 200 || !res.data) {
//             publish(RESULT_EVENT_NAME, {
//                 severity: 'error',
//                 message: t('failedToUploadCanvas')
//             })
//             console.log('CanvasWrapper', 'init', 'end')
//             return
//         }

//         publish(RESULT_EVENT_NAME, {
//             severity: 'success',
//             message: t('successfullyUploadedCanvas')
//         })

//         const uint8ClampedArray = new Uint8ClampedArray((res.data.data as any).data)
//         console.log('uint8ClampedArray', uint8ClampedArray)
//         const image = new ImageData(uint8ClampedArray, res.data.width, res.data.height, { colorSpace: res.data.colorSpace })
//         console.log('image', image)
//         canvas.current?.getContext('2d', { willReadFrequently: true }).putImageData(image, 0, 0)

//         console.log('CanvasWrapper', 'init', 'end')
//     }

//     useEffect(() => {
//         if (outRef)
//             outRef.current = canvas.current

//         init()
//     }, [defaultCanvas, canvas, canvas.current])

//     return (<Canvas onChange={onChange} outRef={canvas} />)
// }
