import { CSSProperties, useEffect, useState } from "react";
import { TextField } from "@mui/material";
import PokerButton from "./PokerButton";
import { maximumIssueNameLength } from "../../constant/maximum-length";
import { Poker } from "../../models/poker";
import { UserProfile } from "../../models/user";
import { updateIssueName } from "../../repository/firestore/poker";
import { notMultiSpace, notStartWithSpace, setValue } from "../../utils/input";

export default function PokeTable(props: {roomID: string, poker: Poker, profile: UserProfile, className?: string, style?: CSSProperties}) {
    const [issueName, setIssueName] = useState<string>(props.poker.issueName ?? '');
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        const timer = countdown > 0 && setInterval(() => {
            setCountdown(countdown - 1);
        }, 1000);
        if (typeof timer == "number") {
            return () => clearInterval(timer);
        }
        if (countdown === 0 && issueName !== props.poker.issueName) {
            updateIssueName(props.roomID, issueName);
        }
    }, [countdown]);

    useEffect(() => {
        setIssueName(props.poker.issueName ?? '');
    }, [props.poker.issueName]);

    return <div className={"rounded-md border border-[#74b3ff] bg-[#D7E9FF] flex items-center justify-center" + ( props.className ? ` ${props.className}` : '' )} style={props.style}>
        <div className="flex flex-col items-center gap-4 m-auto">
            <TextField
                variant="standard"
                placeholder="Enter issue name"
                label="Issue Name"
                value={issueName || ''}
                onChange={e => {
                    setValue(setIssueName, { maximum: maximumIssueNameLength, others: [notStartWithSpace, notMultiSpace] })(e)
                    setCountdown(2);
                }}
                disabled={!(props.poker.user[props.profile.userUUID]?.isFacilitator || (!props.poker.user[props.profile.userUUID]?.isSpectator && props.poker.user[props.profile.userUUID]?.activeSessions?.length > 0))}
            />
            <PokerButton poker={props.poker} profile={props.profile} />
        </div>
    </div>
}
