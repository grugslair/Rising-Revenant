//libs
import React, { useEffect, useState } from "react";
import { useDojo } from "../../hooks/useDojo";
import { CreateRevenantProps } from "../../dojo/types";
import { PrepPhaseStages } from "./prepPhaseManager";

// comps/elements
import { HasValue, getComponentValueStrict, Has } from "@latticexyz/recs";
import { useEntityQuery, useComponentValue } from "@latticexyz/react";

import "./PagesStyles/BuyingPageStyle.css"

import { ClickWrapper } from "../clickWrapper";
import { getEntityIdFromKeys } from "@dojoengine/utils";

import CounterElement from "../Elements/counterElement";
import { setClientGameComponent } from "../../utils";
import { GAME_CONFIG_ID } from "../../utils/settingsConstants";

interface BuyRevenantPageProps {
    setMenuState: React.Dispatch<PrepPhaseStages>;
}

const IMAGES = ["./revenants/1.png", "./revenants/2.png", "./revenants/3.png", "./revenants/4.png", "./revenants/5.png"]

export const BuyRevenantPage: React.FC<BuyRevenantPageProps> = ({ setMenuState }) => {
    const [revenantNumber, setRevenantNumber] = useState(5);
    const [revenantCost, setRevenantCost] = useState(10);

    const [freeRevs, setFreeRevs] = useState<number>(10);

    const [backgroundImage, setBackgroundImage] = useState("");
    const [text, setText] = useState(`"Summoning a Revenant will allow you to call forth a powerful ally from the realm of the undead."`);
    const [opacity, setOpacity] = useState(1);

    const {
        account: { account },
        networkLayer: {
            network: { contractComponents, clientComponents },
            systemCalls: { create_revenant },
        },
    } = useDojo();

    const ownReveants = useEntityQuery([HasValue(contractComponents.Outpost, { owner: account.address })]);

    const clientGameComp = getComponentValueStrict(clientComponents.ClientGameData, getEntityIdFromKeys([BigInt(GAME_CONFIG_ID)]));

    const gameComponent = getComponentValueStrict(contractComponents.Game, getEntityIdFromKeys([BigInt(clientGameComp.current_game_id)]));
    const gameEntityCounter = useComponentValue(contractComponents.GameEntityCounter, getEntityIdFromKeys([BigInt(clientGameComp.current_game_id)]))

    // at the start choose from the random images to load in 
    useEffect(() => {
        setRevenantCost(Number(gameComponent.revenant_init_price));

        const randomImage = IMAGES[Math.floor(Math.random() * IMAGES.length)];
        setBackgroundImage(`${randomImage}`);
    }, []);
    //can these two useffects be merged?
    useEffect(() => {
        const intervalId = setInterval(() => {
            setOpacity(0);
            setTimeout(() => {
                setText((prevText) =>
                    prevText === `"Summoning a Revenant will allow you to call forth a powerful ally from the realm of the undead."`
                        ? `"This Revenant, after being summoned successfully, will settle and be responsible for protecting an outpost with the goal of being the last one alive."`
                        : `"Summoning a Revenant will allow you to call forth a powerful ally from the realm of the undead."`
                );
                setOpacity(1);
            }, 1000);
        }, 10000);

        return () => clearInterval(intervalId);
    }, []); // Empty dependency array ensures the effect runs only once on mount


    useEffect(() => {
        setFreeRevs(Number(gameComponent.max_amount_of_revenants) - Number(gameEntityCounter.revenant_count));
    }, [gameEntityCounter]);


    // utility functions
    const summonRev = async (num: number) => {

        const game_id: number = clientGameComp.current_game_id;

        const createRevProps: CreateRevenantProps = {
            account: account,
            game_id: game_id,
            count: num
        };

        await create_revenant(createRevProps);

    };
    const switchToGuest = async () => {
        setClientGameComponent(clientGameComp.current_game_state, clientGameComp.current_game_id, clientGameComp.current_block_number, true, clientGameComp.current_event_drawn, clientComponents);
    };

    return (
        <div className="game-page-container" style={{ aspectRatio: "31/16", display: "flex", flexDirection: "row", color: "white" }}>
            <img className="page-img" src={`${backgroundImage}`} alt="testPic" />

            <div style={{ height: "100%", margin: "0px 5%", width: "90%", position: "relative", display: "flex", flexDirection: "column" }}>
                <div style={{ height: "20%", width: "100%", position: "relative" }}></div>

                <ClickWrapper style={{ height: "50%", width: "100%", position: "relative", display: "grid", gridTemplateRows: "repeat(5,1fr)", gridTemplateColumns: "repeat(2,1fr)" }}>
                    <div style={{ gridRow: "2/3", gridColumn: "1/2", display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
                        <h2 style={{ fontFamily: "Zelda", fontWeight: "100", fontSize: "3vw" }}>SUMMON A REVENANT</h2>
                    </div>
                    <div style={{ gridRow: "3/6", gridColumn: "1/2" }}>
                        {freeRevs > 0 ? (
                            <>
                                <CounterElement value={revenantNumber} setValue={setRevenantNumber} containerStyleAddition={{ maxWidth: "40%" }} additionalButtonStyleAdd={{ padding: "2px", boxSizing: "border-box", width: "15%" }} textAddtionalStyle={{ fontSize: "2cqw" }} />
                                <h2 className="global-button-style no-margin test-h2" style={{ width: "fit-content", padding: "5px 10px"}} onMouseDown={() => { summonRev(revenantNumber) }}>Summon (Tot: {revenantNumber * revenantCost} $Lords)</h2>
                            </>)
                            :
                            (<>
                                {ownReveants.length === 0 ?
                                    (<h2 className="global-button-style no-margin test-h2" style={{ width: "fit-content", padding: "5px 10px" }} onMouseDown={() => { switchToGuest() }}>No Revenants left to summon and you own none, Join as a guest</h2>)
                                    :
                                    (<h2 className="global-button-style no-margin test-h2" style={{ width: "fit-content", padding: "5px 10px" }} onMouseDown={() => { setMenuState(PrepPhaseStages.BUY_REIN); }}>No Revenants left to summon, continue to reinforcement page</h2>)}
                            </>)
                        }
                    </div>

                    <div style={{ gridRow: "2/6", gridColumn: "2/3", display: "flex", flexDirection: "row" }}>
                        <div style={{ height: "100%", width: "30%" }}></div>
                        <div style={{ height: "100%", width: "70%" }}>
                            <h2 className="no-margin test-h2" style={{ opacity, transition: "opacity 1s", fontStyle: "italic"}}>{text}</h2>
                        </div>
                    </div>
                </ClickWrapper>

                <div style={{ height: "20%", width: "100%", position: "relative" }}></div>

                <div style={{ height: "10%", width: "100%", position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h2 className="no-margin test-h2" style={{fontFamily: "OL", color: "white"}}> 1 Revenant = {revenantCost} $LORDS</h2>

                    {ownReveants.length > 0 &&
                        <ClickWrapper onMouseDown={() => { setMenuState(PrepPhaseStages.BUY_REIN); }} className="global-button-style no-margin test-h2"
                            style={{ padding: "5px 10px" }}
                                > Buy Reinforcements
                            <img className="embedded-text-icon" src="right-arrow.png" alt="Sort Data" onMouseDown={() => { }} />
                        </ClickWrapper>
                    }
                </div>
            </div>
        </div>
    )
}
