//libs
import React, { useEffect } from "react";
import { HasValue, getComponentValueStrict, Has } from "@latticexyz/recs";
import { useEntityQuery } from "@latticexyz/react";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { MenuState } from "./gamePhaseManager";
import { useDojo } from "../../hooks/useDojo";

//styles
import "./PagesStyles/WinnerPageStyles.css";

//elements/components
import { ClickWrapper } from "../clickWrapper";
import { ClaimEndGameRewards, ClaimScoreRewards } from "../../dojo/types";
import { GAME_CONFIG_ID } from "../../utils/settingsConstants";

//pages


/*notes
    this page should either have a way to get the winning user or just calc but it self (for now prob just calc it)
    and then depending on if the user is the winner or not it will display a different message


    should call the jackpot function
*/

interface WinnerPageProps {
    setMenuState: React.Dispatch<React.SetStateAction<MenuState>>;
}

export const WinnerPage: React.FC<WinnerPageProps> = ({ setMenuState }) => {
    const [winningAddress, setWinningAddress] = React.useState<string>("");

    const closePage = () => {
        setMenuState(MenuState.NONE);
    };

    const {
        account: { account },
        networkLayer: {
            network: { contractComponents,clientComponents },
            systemCalls: {claim_score_rewards, claim_endgame_rewards}
        },
    } = useDojo();

    const outpostDeadQuery = useEntityQuery([HasValue(contractComponents.Outpost, { lifes: 0 })]);
    const totalOutposts = useEntityQuery([Has(contractComponents.Outpost)]);

    const clientGameData = getComponentValueStrict(clientComponents.ClientGameData, getEntityIdFromKeys([BigInt(GAME_CONFIG_ID)]));

    useEffect(() => {

        if (totalOutposts.length === 0) {
            setWinningAddress("No winner");
            return;
        }

        const difference: string[] = totalOutposts.filter(item => !outpostDeadQuery.includes(item));

        const outpostComp = getComponentValueStrict(contractComponents.Outpost, getEntityIdFromKeys([BigInt(difference[0])]));

        setWinningAddress(outpostComp.owner);

    }, []);

    const shareOnTwitter = () => {
        const message = 'I am the Rising Revenant.\n After a long battle, time to enjoy my $LORDS Jackpot';
        const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
        window.open(twitterShareUrl, '_blank');
    };

    const claimEndGameRewards = async () => {

        const props: ClaimEndGameRewards = {
            account: account,
            game_id: clientGameData.current_game_id,
        };

        await claim_endgame_rewards(props);
    }

    const claimScoreRewards = async () => {

        const props: ClaimScoreRewards = {
            account: account,
            game_id: clientGameData.current_game_id,
        };

        await claim_score_rewards(props);
    }


    return (
        <div className="game-page-container">
            <img className="page-img brightness-down" src="./revenant_vincitore_image.png" alt="testPic" />
            <div className="content-container" style={{ position: "relative" }}>

                {winningAddress === account.address ?
                    (<>
                        <h3 className="test-h2">Address: {winningAddress}</h3>
                        <h1 className="test-h1">YOU ARE THE RISING REVENANT</h1>
                        <ClickWrapper className="global-button-style test-h2" style={{padding:"5px 10px", margin:"1%"}} onClick={claimEndGameRewards}>Claim your jackpot</ClickWrapper>
                        <ClickWrapper className="global-button-style test-h2" style={{padding:"5px 10px", margin:"1%"}} onClick={claimScoreRewards}>Claim your contribution award</ClickWrapper>
                    </>)
                    :
                    (<>
                        <h3 className="test-h2">Address: {winningAddress}</h3>
                        <h1 className="test-h1">IS THE RISING REVENANT</h1>
                        <ClickWrapper className="global-button-style test-h2" style={{padding:"5px 10px", margin:"1%"}} onClick={claimScoreRewards}>Claim your contribution award</ClickWrapper>
                    </>)}

            </div>

            {winningAddress === account.address && (
                <ClickWrapper
                    style={{
                        position: "absolute",
                        bottom: "0px",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        textAlign: "center",
                        color: "white",
                        fontFamily: "OL"
                    }}
                    onMouseDown={() => {
                        shareOnTwitter();
                    }}
                    className="pointer"
                >
                    <h1>
                        Share on
                        <img src="X_logo_white.png" style={{ marginLeft: "10px" }} className="test-embed" alt="" />
                    </h1>
                </ClickWrapper>
            )}
        </div>
    )
}
