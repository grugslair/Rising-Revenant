import request from "graphql-request";
import { useEffect, useState } from "react";
import { getCount } from "../../../utils";
import { CreateTradeForReinf } from "../../../dojo/types";
import CounterElement from "../../Elements/counterElement";
import { ConfigProvider, Flex, InputNumber } from "antd";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { useDojo } from "../../../hooks/useDojo";

import { useComponentValue } from "@latticexyz/react";
import { getComponentValueStrict } from "@latticexyz/recs";
import { GAME_CONFIG_ID } from "../../../utils/settingsConstants";

export const SellReinforcementTradeWindow: React.FC = () => {

    const [priceValue, setPriceValue] = useState<number | null>(1);
    const [amountToSell, setAmountToSell] = useState<number>(0);

    const [numberOfCurrentTrades, setNumberOfCurrentTrades] = useState<number>(-1);

    const {
        account: { account },
        networkLayer: {
            network: { contractComponents, clientComponents },
            systemCalls: { create_trade_reinf }
        },
    } = useDojo();

    const clientGameData = getComponentValueStrict(clientComponents.ClientGameData, getEntityIdFromKeys([BigInt(GAME_CONFIG_ID)]))
    const playerInfo = useComponentValue(contractComponents.PlayerInfo, getEntityIdFromKeys([BigInt(clientGameData.current_game_id), BigInt(account.address)]))

    useEffect(() => {

        if (playerInfo === undefined) { return; }

        if (amountToSell < 0) {
            setAmountToSell(0)
            return;
        }

        if (amountToSell > playerInfo.reinforcement_count) {
            setAmountToSell(playerInfo.reinforcement_count);
        }

    }, [account, playerInfo, amountToSell])

    useEffect(() => {

        if (playerInfo === undefined) { return; }

        if (amountToSell < 0) {
            setAmountToSell(0)
            return;
        }

        if (amountToSell > playerInfo.reinforcement_count) {
            setAmountToSell(playerInfo.reinforcement_count);
        }

    }, [account, playerInfo, amountToSell])

    useEffect(() => {
        const fetchData = async () => {
            const graphqlRequest = `query {
            tradeModels(
              where: {
                game_id: 1,
                status: 1,
              }
            ) {
              edges {
                node {
                  entity {
                    keys
                    models {
                      __typename
                      ... on Trade {
                        game_id
              entity_id
              seller
              price
              count
              buyer
              status
                      }
                    }
                  }
                }
              }
              total_count
            }
          }`;

            const endpoint = import.meta.env.VITE_PUBLIC_TORII;

            try {
                const data = await request(endpoint, graphqlRequest);
                setNumberOfCurrentTrades(getCount(data, "tradeModels"))
            } catch (error) {
                console.error('Error executing GraphQL query:', error);
                throw error;
            }
        };

        fetchData();
    }, []);

    const confirmCreationOfOrder = async () => {

        const createTradeProp: CreateTradeForReinf = {
            account: account,
            game_id: clientGameData.current_game_id,
            count: amountToSell,
            price: priceValue!,
        };

        await create_trade_reinf(createTradeProp);
    };

    return (
        <>

            <div style={{ height: "100%", width: "10%" }}></div>

            <div style={{ height: "100%", width: "38.5%", overflow: "visible" }} className="center-via-flex">
                <img src="./assets/Page_Bg/REINFORCEMENT_PAGE_BG.png" style={{ height: "100%", aspectRatio: "3/2" }}></img>
            </div>

            <div style={{ height: "100%", width: "8.5%" }}></div>

            <div style={{ height: "100%", width: "19%", display: "grid", gridTemplateRows: "repeat(9,1fr)", gridTemplateColumns: "repeat(5, 1fr)", color: "white" }}>
                <div style={{ gridRow: "1/2", gridColumn: "1/6" }}> <h2 className="test-h2 no-margin">Sell Reinfrocements</h2></div>

                <div style={{ gridRow: "2/3", gridColumn: "1/5", display: "flex", justifyContent: "flex-start", alignItems: "center", gap: "20%" }}>
                    <div className="global-button-style no-margin" style={{ height: "80%", aspectRatio: "1/1" }}>
                        <img src="minus.png" style={{ width: "100%", height: "100%" }} className="pointer" onClick={() => setAmountToSell(amountToSell - 1)} />
                    </div>

                    <h1 className="no-margin test-h1-5">{amountToSell}</h1>

                    <div className="global-button-style no-margin" style={{ height: "80%", aspectRatio: "1/1" }}>
                        <img src="plus.png" style={{ width: "100%", height: "100%" }} className="pointer" onClick={() => setAmountToSell(amountToSell + 1)} />
                    </div>
                </div>

                <div style={{ gridRow: "4/5", gridColumn: "1/6" }}>
                    <h2 className="test-h2 no-margin">Set a Price</h2>
                </div>
                <div style={{ gridRow: "5/6", gridColumn: "1/6" }}>

                    <ConfigProvider
                        theme={{
                            token: {
                               colorText:"white",
                               fontSize:"clamp(1.1rem, 0.7vw + 0.8rem, 8rem)"
                            },
                        }}
                    >
                        <InputNumber min={1} max={50} value={priceValue} onChange={setPriceValue} style={{ backgroundColor: "#131313", borderColor: "#2D2D2D", width: "60%", height: "fit-content" }} />
                    </ConfigProvider>

                </div>
                <div style={{ gridRow: "6/7", gridColumn: "1/6", width: "100%", height: "100%", display: "flex", justifyContent: "center" }}>
                    <h4 className="no-margin test-h4" style={{ marginTop: "auto", marginRight: "auto" }}> current Active Trades: {numberOfCurrentTrades}</h4>
                </div>

                <div style={{ gridRow: "9/10", gridColumn: "1/6", display: "flex", justifyContent: "flex-end" }}>
                    <div className="global-button-style" style={{ marginTop: "auto", padding:"2px 5px" }} onClick={confirmCreationOfOrder}>Confirm</div>
                </div>
            </div>

            <div style={{ height: "100%", width: "24%" }}></div>

        </>
    )
}