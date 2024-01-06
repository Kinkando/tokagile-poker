import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Divider, Card, Box, CircularProgress } from '@mui/material';
import ScrumPokerImg from '/images/estimation.png';
import GlobalContext from '../context/global';
import CreatePokerOption from '../components/partials/CreatePokerOption';
import GoogleButton from '../components/partials/GoogleButton';
import { signInGoogle, signout } from '../firebase/authentication';
import { createPokerRoom, isExistsPokerRoom } from '../repository/firestore/poker';
import { getUserProfile, signin } from '../repository/firestore/user';
import { CreatePokerOptionDialog } from '../models/poker';
import { pressEnter, setValue } from '../utils/input';

export default function HomePage() {
    const { profile, setProfile, alert, setLoading, isLoading } = useContext(GlobalContext);
    const navigate = useNavigate();

    const [roomID, setRoomID] = useState('');
    const [isFindRoom, setFindRoom] = useState(false);
    const [isCreateRoom, setCreateRoom] = useState(false);

    async function setUserProfile() {
        try {
            const user = await getUserProfile();
            if (!user) {
                throw Error('user not found')
            }
            setProfile(user);
        } catch (error) {
            alert({message: 'Failed to get user profile', severity: 'error'});
        }
    }

    useEffect(() => {
        init();
        async function init() {
            await setUserProfile();
            setLoading(false);
        }
    }, []);

    async function joinRoom() {
        if (!roomID) {
            return;
        }
        setFindRoom(true);
        try {
            const isRoomExists = await isExistsPokerRoom(roomID);
            setFindRoom(false);
            if (!isRoomExists) {
                throw Error('Room number is not found');
            }
            navigate(`/${roomID}`);
        } catch (error) {
            alert({message: `${error}`, severity: 'error'});
        }
    }

    async function createRoom(req: CreatePokerOptionDialog) {
        if (profile.displayName) {
            setLoading(true);
            try {
                const roomID = await createPokerRoom(profile.userUUID, req.displayName, req.roomName, req.isSpectator, req.option);
                navigate(`/${roomID}`);
            } catch (error) {
                alert({message: 'Create room failed', severity: 'error'});
            }
            setLoading(false);
        }
    }

    async function signInWithGoogle() {
        setLoading(true);
        try {
            const user = await signInGoogle();
            if (user) {
                await signin({
                    userUID: user.uid,
                    email: user.email || undefined,
                    displayName: user.displayName || 'User',
                    isAnonymous: false,
                    isLinkGoogle: true,
                });
                await setUserProfile();
                alert({message: 'Sign in with google successfully', severity: 'success'});
            }
        } catch (error) {
            // Maybe error is `auth/popup-closed-by-user`, so skip alert
        }
        setLoading(false);
    }

    async function signOut() {
        setLoading(true);
        try {
            await signout();
            await setUserProfile();
            alert({message: 'Sign out successfully', severity: 'success'});
        } catch (error) {
            alert({message: 'Sign out failed', severity: 'error'});
        }
        setLoading(false);
    }

    return (
        <>
            <div className="w-screen h-screen flex overflow-y-auto">
                <div className="w-full bg-white px-6 max-[900px]:hidden" id="{page}-logo">
                    <div className="relative top-1/2 -translate-y-1/2 overflow-y-auto">
                        <img className="m-auto" src={ScrumPokerImg} alt="Scrum Poker" />
                    </div>
                </div>
                <div className="w-full max-[900px]:bg-blue-400 min-[901px]:bg-blue-200 p-4">
                    <div className="relative top-1/2 -translate-y-1/2 overflow-y-auto">
                        <Card className="w-96 max-w-fit m-auto rounded-md p-4 flex flex-col gap-4">
                            <div className="text-center text-3xl">Poker</div>
                            <div className="flex gap-4">
                                <TextField
                                    size='medium'
                                    className='w-full rounded-md bg-white px-4'
                                    placeholder='Enter Room Number'
                                    label="Room Number"
                                    variant="outlined"
                                    value={roomID}
                                    onChange={setValue(setRoomID)}
                                    onKeyDown={pressEnter(joinRoom)}
                                    disabled={isLoading || isFindRoom}
                                />
                                <Box sx={{ position: 'relative' }}>
                                    <Button
                                        variant='contained'
                                        size='medium'
                                        className='h-full rounded-md px-2 py-1'
                                        onClick={joinRoom}
                                        color='primary'
                                        disabled={isLoading || isFindRoom || !roomID}
                                    >
                                        Join
                                    </Button>
                                    {isFindRoom && <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-3"><CircularProgress size={24} /></div>}
                                </Box>
                            </div>

                            <Button
                                variant='contained'
                                size="large"
                                color="success"
                                className="w-full"
                                onClick={() => setCreateRoom(true)}
                                disabled={isLoading || isFindRoom}
                            >
                                New game
                            </Button>

                            <Divider></Divider>

                            <GoogleButton profile={profile} onSignin={signInWithGoogle} onSignout={signOut} disabled={isLoading || isFindRoom} />
                        </Card>
                    </div>
                </div>
            </div>

            <CreatePokerOption
                profile={profile}
                isOpen={isCreateRoom}
                onCancel={() => setCreateRoom(false)}
                onSubmit={createRoom}
            />
        </>
    )
}
