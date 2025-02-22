import type { EditorOptions } from "@tiptap/core";
import { useCallback, useRef, useState } from "react";
import {
    LinkBubbleMenu,
    MenuButton,
    RichTextEditor,
    TableBubbleMenu,
    insertImages,
    type RichTextEditorRef,
} from "mui-tiptap";
import EditorMenuControls from "./EditorMenuControls";
import { useExtensions } from "./useExtensions";

import './styles.css'
import { Stack } from "../Stack";
import { CheckIcon, EyeClosedIcon, EyeIcon, LockIcon, LockOpenIcon } from "lucide-react";
import { Button } from "../Button";
import { Tooltip } from "../Tooltip";

function fileListToImageFiles(fileList: FileList): File[] {
    // You may want to use a package like attr-accept
    // (https://www.npmjs.com/package/attr-accept) to restrict to certain file
    // types.
    return Array.from(fileList).filter((file) => {
        const mimeType = (file.type || "").toLowerCase();
        return mimeType.startsWith("image/");
    });
}

export type TextEditorProps = {
    text?: string;
    onChange?: (html: string) => void | Promise<void>;
    placeholder?: string;
}

export function TextEditor({ text, onChange, placeholder = "Add your own content here..." }: TextEditorProps) {
    const extensions = useExtensions({ placeholder });
    const rteRef = useRef<RichTextEditorRef>(null);
    const [isEditable, setIsEditable] = useState<boolean>(true);
    const [showMenuBar, setShowMenuBar] = useState<boolean>(true);

    const [saving, setSaving] = useState<boolean>(false);

    const handleNewImageFiles = useCallback(
        (files: File[], insertPosition?: number): void => {
            if (!rteRef.current?.editor) {
                return;
            }

            // For the sake of a demo, we don't have a server to upload the files to,
            // so we'll instead convert each one to a local "temporary" object URL.
            // This will not persist properly in a production setting. You should
            // instead upload the image files to your server, or perhaps convert the
            // images to bas64 if you would like to encode the image data directly
            // into the editor content, though that can make the editor content very
            // large. You will probably want to use the same upload function here as
            // for the MenuButtonImageUpload `onUploadFiles` prop.
            const attributesForImageFiles = files.map((file) => ({
                src: URL.createObjectURL(file),
                alt: file.name,
            }));

            insertImages({
                images: attributesForImageFiles,
                editor: rteRef.current.editor,
                position: insertPosition,
            });
        },
        [],
    );

    // Allow for dropping images into the editor
    const handleDrop: NonNullable<EditorOptions["editorProps"]["handleDrop"]> = useCallback(
        (view, event, _slice, _moved) => {
            if (!(event instanceof DragEvent) || !event.dataTransfer) {
                return false;
            }

            const imageFiles = fileListToImageFiles(event.dataTransfer.files);
            if (imageFiles.length > 0) {
                const insertPosition = view.posAtCoords({
                    left: event.clientX,
                    top: event.clientY,
                })?.pos;

                handleNewImageFiles(imageFiles, insertPosition);

                // Return true to treat the event as handled. We call preventDefault
                // ourselves for good measure.
                event.preventDefault();
                return true;
            }

            return false;
        },
        [handleNewImageFiles],
    );

    // Allow for pasting images
    const handlePaste: NonNullable<EditorOptions["editorProps"]["handlePaste"]> = useCallback(
        (_view, event, _slice) => {
            if (!event.clipboardData) {
                return false;
            }

            const pastedImageFiles = fileListToImageFiles(
                event.clipboardData.files,
            );
            if (pastedImageFiles.length > 0) {
                handleNewImageFiles(pastedImageFiles);
                // Return true to mark the paste event as handled. This can for
                // instance prevent redundant copies of the same image showing up,
                // like if you right-click and copy an image from within the editor
                // (in which case it will be added to the clipboard both as a file and
                // as HTML, which Tiptap would otherwise separately parse.)
                return true;
            }

            // We return false here to allow the standard paste-handler to run.
            return false;
        },
        [handleNewImageFiles],
    );

    return (
        <>
            <div className="h-full [&_.ProseMirror]:[&_h1]:scroll-mt-[50px] [&_.ProseMirror]:[&_h2]:scroll-mt-[50px] [&_.ProseMirror]:[&_h3]:scroll-mt-[50px] [&_.ProseMirror]:[&_h4]:scroll-mt-[50px] [&_.ProseMirror]:[&_h5]:scroll-mt-[50px] [&_.ProseMirror]:[&_h6]:scroll-mt-[50px]">
                <RichTextEditor
                    ref={rteRef}
                    className="editor"
                    extensions={extensions}
                    content={text}
                    onUpdate={async ({ editor }) => {
                        if (onChange)
                            await onChange(editor.getHTML())
                    }}
                    editable={isEditable}
                    editorProps={{
                        handleDrop: handleDrop,
                        handlePaste: handlePaste,
                    }}
                    renderControls={() => <EditorMenuControls />}
                    RichTextFieldProps={{
                        variant: 'standard',
                        MenuBarProps: {
                            hide: !showMenuBar,
                        },
                        footer: (
                            <Stack stackProps={{ className: 'border-t py-1' }}>
                                <Tooltip tooltipContent={showMenuBar ? "Formatting visible" : "Formatting visible"}>
                                    <Button
                                        isIcon
                                        variant="text"
                                        onClick={() => setShowMenuBar((currentState) => !currentState)}
                                    >
                                        {showMenuBar ? <EyeIcon /> : <EyeClosedIcon />}
                                    </Button>
                                </Tooltip>

                                <Tooltip tooltipContent={isEditable ? "Prevent edits (use read-only mode)" : "Allow edits"}>
                                    <Button
                                        isIcon
                                        variant="text"
                                        onClick={() => setIsEditable((currentState) => !currentState)}
                                    >
                                        {isEditable ? <LockOpenIcon /> : <LockIcon />}
                                    </Button>
                                </Tooltip>
                            </Stack>
                        ),
                    }}
                >
                    {() => (
                        <>
                            <LinkBubbleMenu />
                            <TableBubbleMenu />
                        </>
                    )}
                </RichTextEditor>
            </div>
        </>
    );
}

