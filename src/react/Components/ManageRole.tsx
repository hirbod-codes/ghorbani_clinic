export default function ManageRole({ defaultRole, onFinish }: { defaultRole?: string, onFinish?: () => Promise<void> | void }) {
    return (
        <>
            <div>ManageRole</div>
            {defaultRole}
        </>
    )
}

