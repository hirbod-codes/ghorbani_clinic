import { memo } from "react"
import { Stack } from "../Components/Base/Stack"
import { Button } from "../Components/Base/Button"
import { t } from "i18next"
import { useNavigate } from "react-router-dom"

export const Error = memo(function Error() {
    const navigate = useNavigate()

    let message = '!!!'
    try { message = t('Error.errorMessage') }
    catch (e) { console.error(e) }

    let buttonText = 'to home'
    try { buttonText = t('Error.buttonText') }
    catch (e) { console.error(e) }

    return (
        <>
            <Stack direction='vertical' stackProps={{ className: 'size-full justify-center items-center' }}>
                <div className="text-3xl">{message}</div>
                <Stack stackProps={{ className: 'justify-center items-center' }}>
                    <Button onClick={() => navigate('/')}>
                        {buttonText}
                    </Button>
                </Stack>
            </Stack>
        </>
    )
})

