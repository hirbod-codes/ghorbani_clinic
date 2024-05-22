import { AppBar, IconButton, Toolbar } from "@mui/material";

import MenuIcon from '@mui/icons-material/Menu';
import { Search } from "../components/Search";
import { AnimatedCounter } from "../components/AnimatedCouner";


export function Home() {
    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="open drawer"
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Search />
                </Toolbar>
            </AppBar>
            <h2>Hello from React</h2>

            <AnimatedCounter countTo={500} />
        </>
    );
}
