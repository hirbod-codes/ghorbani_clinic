export default function ManageRole({ defaultRole, onClose }: { defaultRole?: string, onClose?: () => Promise<void> | void }) {
    return (
        <>
            <div>ManageRole</div>
            {defaultRole}
        </>
    )
}

