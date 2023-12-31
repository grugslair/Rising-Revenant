//libs
import React, { useEffect, useState } from "react";
import { PrepPhaseStages } from "./prepPhaseManager";
import { getComponentValueStrict } from "@latticexyz/recs";

import { ClickWrapper } from "../clickWrapper";
import { useDojo } from "../../hooks/useDojo";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { useComponentValue} from "@latticexyz/react";

//styles
import "./PagesStyles/PrepPhaseEndsPageStyles.css";
import "./PagesStyles/BuyingPageStyle.css";
import { GAME_CONFIG_ID } from "../../utils/settingsConstants";
import { convertBlockCountToTime } from "../../utils";
import { useLeftBlockCounter } from "../Elements/leftBlockCounterElement";

//components

//pages

/*notes
    this page is fine 
*/

export const GuestPagePrepPhase: React.FC= () => {
    const [showBlocks, setShowBlocks] = useState(true);

    const [freeRevs, setFreeRevs] = useState<number>(10);

    const toggleShowBlocks = () => {
        setShowBlocks((prevShowBlocks) => !prevShowBlocks);
    };

    const {
        networkLayer: {
          network: { contractComponents, clientComponents }
        },
    } = useDojo();

    const clientGame = useComponentValue(clientComponents.ClientGameData, getEntityIdFromKeys([BigInt(GAME_CONFIG_ID)]));
    
    const gameData = getComponentValueStrict(contractComponents.Game, getEntityIdFromKeys([BigInt(clientGame.current_game_id)]));
    const gameEntityCounter = getComponentValueStrict(contractComponents.GameEntityCounter, getEntityIdFromKeys([BigInt(clientGame.current_game_id)]));

    useEffect(() => {
        setFreeRevs(Number(gameData.max_amount_of_revenants) - Number(gameEntityCounter.revenant_count));
    }, [gameEntityCounter, gameData]);
 
    const { blocksLeftData } = useLeftBlockCounter();
    const { numberValue, stringValue } = blocksLeftData;

    return (
        <div className="ppe-page-container">
            <img src="./assets/Page_Bg/CALL_TO_JOIN_BG.png"  alt="testPic " className="brightness-down" />
            <ClickWrapper className="content-space center-via-flex">

                <div style={{height:"70%", width:"65%", display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gridTemplateRows:"repeat(3, 1fr)", position:"relative"}}>
                    <div style={{gridColumn:"1/3", gridRow:"1/2"}} className="center-via-flex">
                        <h2 style={{textAlign:"center"}}>Current Jackpot <br/> {gameData.prize.toString()}</h2>
                    </div>
                    <div style={{gridColumn:"1/2", gridRow:"2/3"}} className="center-via-flex">
                        <h2 style={{textAlign:"center"}}>Revenants Left to be summoned<br/> { gameData.max_amount_of_revenants - gameEntityCounter.revenant_count}</h2>
                    </div>
                    <div style={{gridColumn:"2/3", gridRow:"2/3"}} className="center-via-flex">
                        {showBlocks ? <h2 style={{textAlign:"center"}} className="pointer" onClick={toggleShowBlocks}>Blocks Left: <br/> {numberValue}</h2> : <h2 style={{textAlign:"center"}} className="pointer" onClick={toggleShowBlocks}>Time Left: <br/> {stringValue}</h2>}
                    </div>
                    <div style={{gridColumn:"1/3", gridRow:"3/4"}} className="center-via-flex">
                        <div className="global-button-style" onClick={() => window.location.reload()} style={{textAlign:"center", padding:"5px 10px"}}>Log in</div>
                    </div>
                </div>

            </ClickWrapper>
        </div>
    );
};
