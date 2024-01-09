import { Button, Dialog, DialogActions, DialogContent } from "@mui/material";
import HeaderDialog from "./HeaderDialog";
import { useCallback, useContext } from "react";
import GlobalContext from "../../context/global";
import { signinAnonymous, signout } from "../../firebase/authentication";
import { useLocation, useNavigate } from "react-router-dom";

export default function SignoutDialog(props: {open: boolean, onSubmit?: () => void, onClose?: () => void}) {
    const { setLoading, alert } = useContext(GlobalContext);

    const navigate = useNavigate();
    const location = useLocation();

    const signOut = useCallback(async () => {
        try {
            setLoading(true);
            await signout();
            await signinAnonymous();
            if (props.onClose) {
                props.onClose();
            }
            setLoading(false);
            alert({message: 'Sign out successfully', severity: 'success'});
            if (location.pathname !== '/') {
                navigate('/');
            }
        } catch (error) {
            setLoading(false);
            alert({message: 'Sign out failed', severity: 'error'});
        }
    }, [location.pathname])

    return (
        <Dialog open={props.open} onClose={() => props.onClose && props.onClose()} maxWidth='xs' fullWidth>
            <HeaderDialog title="Sign Out" onClose={props.onClose} />
            <DialogContent>Are you sure to signout?</DialogContent>
            <DialogActions>
                <Button variant="outlined" color="error" onClick={() => props.onClose && props.onClose()}>Cancel</Button>
                <Button variant="contained" color="error" onClick={signOut}>Signout</Button>
            </DialogActions>
        </Dialog>
    );
}
