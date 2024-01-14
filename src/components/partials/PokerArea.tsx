import { useCallback, useContext, useEffect, useState } from "react";
import UserCard from "./UserCard";
import GlobalContext from "../../context/global";
import { maximumVoterNumber } from "../../constant/maximum-length";
import { Poker } from "../../models/poker";
import { UserProfile } from "../../models/user";

export default function PokerArea(props: {roomID: string, poker: Poker, profile: UserProfile}) {
    const { setDisplayVoteButtonOnTopbar } = useContext(GlobalContext);
    const [voterUUIDs, setVoterUUIDs] = useState<string[]>([]);

    useEffect(() => {
        const poker = props.poker;
        const voterUUIDs = !poker
            ? []
            : Object.
                keys(poker.user).
                filter(userUUID => poker.user[userUUID].displayName && !poker.user[userUUID].isSpectator && ((poker.user[userUUID].estimatePoint != null && poker.estimateStatus !== 'CLOSED') || poker.user[userUUID].activeSessions?.length)).
                sort((a, b) => (!poker.user[a].displayName || !poker.user[b].displayName || poker.user[a].displayName === poker.user[b].displayName) ? a.localeCompare(b) : poker.user[a].displayName.localeCompare(poker.user[b].displayName))
        setVoterUUIDs(voterUUIDs);
        setDisplayVoteButtonOnTopbar(voterUUIDs.length > maximumVoterNumber);
    }, [props.poker]);

    const pokeUser = useCallback((userUUID: string, roomID: string, poker: Poker, yourUserUUID: string) => {
        return <UserCard
            key={userUUID}
            roomID={roomID}
            userUUID={userUUID}
            imageURL={poker.user[userUUID].imageURL}
            displayName={poker.user[userUUID].displayName}
            isYou={userUUID === yourUserUUID}
            isShowEstimates={poker.estimateStatus === 'OPENED'}
            estimatePoint={poker.user[userUUID].estimatePoint}
            allowOthersToDeleteEstimates={(poker.user[yourUserUUID]?.isFacilitator || poker.option.allowOthersToDeleteEstimates) && userUUID !== yourUserUUID}
        />
    }, [])

    return (
        <div className="px-4 flex gap-4 flex-wrap w-full h-full justify-center items-center m-auto min-h-[calc(100vh-5rem)] pb-32 pt-4">
            {voterUUIDs.map(userUUID => {
                return <div className="absolute top-0" key={userUUID}>
                    {pokeUser(userUUID, props.roomID, props.poker, props.profile.userUUID)}
                </div>
            })}
        </div>
    );
}
