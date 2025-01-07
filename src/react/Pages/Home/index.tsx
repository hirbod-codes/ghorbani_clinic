import { SearchPatientField } from "../../Components/Search/SearchPatientField";
import { Analytics } from "./Analytics";
import { Clock } from "../../Components/Clock";
import { memo, useCallback, useState } from "react";
import { Calendar } from "./Calendar";
import { Button } from "../../Components/Base/Button";

export const Home = memo(function Home() {
    const [c, setC] = useState({ d: { a: 'a', }, e: { a: 'b' } })

    const changeA = useCallback((a) => {
        console.log('Memoized A', a)
        if (a === 'a')
            c.d.a = 'aaa'
        else
            c.d.a = 'a'

        setC({ ...c })
    }, [])

    const changeB = useCallback((b) => {
        console.log('Memoized B', b)
        if (b === 'b')
            c.d.a = 'aaa'
        else
            c.d.a = 'a'


        setC({ ...c })
    }, [])

    console.log('Home', { c })

    return (
        <div className="size-full overflow-y-auto overflow-x-hidden">
            <div className="grid grid-cols-12 justify-center w-full p-1 *:p-1">
                <Button onClick={() => setC({ ...c })}>renderer</Button>
                <div className="col-span-6">
                    <Button
                        className="w-full"
                        onClick={() => {
                            if (c.d.a === 'a')
                                c.d.a = 'aaa'
                            else
                                c.d.a = 'a'

                            setC({ ...c })
                        }}
                    >
                        Change A
                    </Button>
                </div>
                <div className="col-span-6">
                    <Button
                        className="w-full"
                        onClick={() => {
                            if (c.e.b === 'b')
                                c.e.b = 'bbb'
                            else
                                c.e.b = 'b'

                            setC({ ...c })
                        }}
                    >
                        Change B
                    </Button>
                </div>
                {
                    Object.keys(c).map((char, i) =>
                             <div key={i} className="col-span-full"><Comp1 a={c[char].a} onChange={changeA} /></div>
                    )
                }
                {/* <div className="sm:col-span-0 md:col-span-3" />
                <div className="sm:col-span-12 md:col-span-6 col-span-12">
                    <SearchPatientField />
                </div>
                <div className="sm:col-span-0 md:col-span-3" />

                <div className="sm:col-span-12 md:col-span-3 col-span-12">
                    <Clock />
                </div>

                <div className="sm:col-span-12 md:col-span-4 col-span-12">
                    <Calendar />
                </div>
                <div className="sm:col-span-0" />

                <div className="sm:col-span-12 md:col-span-4 col-span-12">
                    <Analytics />
                </div> */}
            </div>
        </div>
    )
})

const Comp1 = memo(function Comp1({ a, onChange }: { a: string, onChange?: (a: string) => void }) {
    console.log('Comp1', { a, onChange })
    return (
        <div id="Comp1" className="border py-2" onClick={() => { if (onChange) onChange(a) }}>
            Comp1
            {a}
        </div>
    )
})

const Comp2 = memo(function Comp2({ b, onChange }: { b: string, onChange?: (b: string) => void }) {
    console.log('Comp2', { b, onChange })
    return (
        <div id="Comp2" className="border py-2" onClick={() => { if (onChange) onChange(b) }}>
            Comp2
            {b}
        </div>
    )
})
