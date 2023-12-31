//libs
import React, { useEffect, useState } from "react";
import { PrepPhaseStages } from "./prepPhaseManager";
import { toast } from 'react-toastify';
import { PurchaseReinforcementProps } from "../../dojo/types";
import { getComponentValueStrict } from "@latticexyz/recs";

//styles
import "./PagesStyles/BuyingPageStyle.css"

//elements/components
import { ClickWrapper } from "../clickWrapper";
import CounterElement from "../Elements/counterElement";
import { useDojo } from "../../hooks/useDojo";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { hexToNumber } from "../../utils";
import { GAME_CONFIG_ID } from "../../utils/settingsConstants";

//pages

interface BuyReinforcementsPageProps {
    setMenuState: React.Dispatch<PrepPhaseStages>;
}

export const BuyReinforcementPage: React.FC<BuyReinforcementsPageProps> = ({ setMenuState }) => {
    const [reinforcementNumber, setReinforcementNumber] = useState(2);
    const [priceOfReinforcements, setPriceOfReinforcements] = useState<number>(0);

    const [freeRevs, setFreeRevs] = useState<number>(10);

    const [text, setText] = useState(`"Reinforcements provide an additional extra life to your outpost, enhancing the player's ability to withstand hostile attacks."`);
    const [opacity, setOpacity] = useState(1);

    const {
        account: { account },
        networkLayer: {
            network: { clientComponents, contractComponents },
            systemCalls: { purchase_reinforcement, get_current_reinforcement_price },
        },

    } = useDojo();

    // need here a useffect for the price of the reinforcements
    const clientGameData = getComponentValueStrict(clientComponents.ClientGameData, getEntityIdFromKeys([BigInt(GAME_CONFIG_ID)]));

    const gameComponent = getComponentValueStrict(contractComponents.Game, getEntityIdFromKeys([BigInt(clientGameData.current_game_id)]));
    const gameEntityCounter = getComponentValueStrict(contractComponents.GameEntityCounter, getEntityIdFromKeys([BigInt(clientGameData.current_game_id)]));


    useEffect(() => {
        const intervalId = setInterval(() => {
            setOpacity(0);
            setTimeout(() => {
                setText((prevText) =>
                    prevText === `"Reinforcements provide an additional extra life to your outpost, enhancing the player's ability to withstand hostile attacks."`
                        ? `"An outpost can only have a maximum of 20 reinforcements applied during its existance."`
                        : `"Reinforcements provide an additional extra life to your outpost, enhancing the player's ability to withstand hostile attacks."`
                );
                setOpacity(1);
            }, 1000);
        }, 10000);

        return () => clearInterval(intervalId);
    }, []); // Empty dependency array ensures the effect runs only once on mount

    useEffect(() => {
        setFreeRevs(Number(gameComponent.max_amount_of_revenants) - Number(gameEntityCounter.revenant_count));
    }, [gameEntityCounter, gameComponent]);

    useEffect(() => {
        call_price_update();

        const intervalId = setInterval(call_price_update, 5000);

        return () => clearInterval(intervalId);
    }, []);

    const call_price_update = async () => {
        const current_price = await get_current_reinforcement_price(clientGameData.current_game_id, 1);
        setPriceOfReinforcements(hexToNumber(current_price));
    };

    const buyReinforcements = async (num: number) => {

        const props: PurchaseReinforcementProps = {
            account: account,
            game_id: clientGameData.current_game_id,
            count: BigInt(num),
        };

        await purchase_reinforcement(props);
    }

    return (
        <div className="game-page-container" style={{ display: "flex", flexDirection: "row", color: "white" }}>
            <img className="page-img brightness-down" src="./assets/Page_Bg/REINFORCEMENTS_PAGE_BG.png" alt="testPic" />

            <div style={{ height: "100%", margin: "0px 5%", width: "90%", position: "relative", display: "flex", flexDirection: "column" }}>
                <div style={{ height: "20%", width: "100%", position: "relative", display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
                    {freeRevs > 0 && <ClickWrapper onMouseDown={() => { setMenuState(PrepPhaseStages.BUY_REVS); }} className="global-button-style no-margin test-h2"
                        style={{ padding: "5px 10px" }}>
                        <img className="embedded-text-icon" src="left-arrow.png" alt="Sort Data" />
                        Summon more Revenants
                    </ClickWrapper>}
                </div>

                <ClickWrapper style={{ height: "50%", width: "100%", position: "relative", display: "grid", gridTemplateRows: "repeat(5,1fr)", gridTemplateColumns: "repeat(2,1fr)" }}>
                    <div style={{ gridRow: "2/3", gridColumn: "1/2", display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
                        <h1 className="no-margin test-h1" style={{ fontFamily: "Zelda", fontWeight: "100" }}>BUY REINFORCEMENTS</h1>
                    </div>
                    <div style={{ gridRow: "3/6", gridColumn: "1/2" }}>
                        <CounterElement value={reinforcementNumber} setValue={setReinforcementNumber} containerStyleAddition={{ maxWidth: "40%" }} additionalButtonStyleAdd={{ padding: "2px", boxSizing: "border-box", width: "15%" }} textAddtionalStyle={{ fontSize: "2cqw" }} />
                        {priceOfReinforcements !== 0 ?
                            <h2 className="global-button-style no-margin test-h2" style={{ width: "fit-content", padding: "5px 10px", fontWeight: "100" }} onMouseDown={() => { buyReinforcements(reinforcementNumber) }}>Reinforce (Tot: ≈{reinforcementNumber * priceOfReinforcements} $Lords)</h2>
                            :
                            <h2 className="global-button-style no-margin test-h2" style={{ width: "fit-content", padding: "5px 10px", fontWeight: "100", filter: "grayscale(70%)" }} >Waiting to fetch Price</h2>
                        }
                    </div>

                    <div style={{ gridRow: "2/6", gridColumn: "2/3", display: "flex", flexDirection: "row" }}>
                        <div style={{ height: "100%", width: "30%" }}></div>
                        <div style={{ height: "100%", width: "70%" }}>
                            <h2 className="no-margin test-h2" style={{ opacity, transition: "opacity 1s", fontStyle: "italic" }}>{text}</h2>
                        </div>
                    </div>
                </ClickWrapper>

                <div style={{ height: "20%", width: "100%", position: "relative" }}></div>

                <div style={{ height: "10%", width: "100%", position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center" }}>

                    {priceOfReinforcements !== 0 ?
                        <h2 style={{ fontWeight: "100", fontFamily: "OL", color: "white" }} className="no-margin test-h2"> 1 Reinforcement ≈ {priceOfReinforcements} $LORDS</h2>
                        :
                        <h2 style={{ fontWeight: "100", fontFamily: "OL", color: "white" }} className="no-margin test-h2"> Fetching price...</h2>
                    }
                    
                    <ClickWrapper onMouseDown={() => { setMenuState(PrepPhaseStages.WAIT_PHASE_OVER); }} className="global-button-style no-margin test-h2"
                        style={{ padding: "5px 10px" }}
                    > Continue
                        <img className="embedded-text-icon" src="right-arrow.png" alt="Right Arrow" onMouseDown={() => { }} />
                    </ClickWrapper>
                </div>
            </div>

        </div>
    )
}
