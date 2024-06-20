export default function ManageRole({ role, onClose }: { role?: string, onClose?: () => Promise<void> | void }) {
    return (
        <>
            <div>ManageRole</div>
            {role}
        </>
    )
}

