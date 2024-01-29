import React, { useState, useEffect, useRef } from "react";

import "./ComponentsStyles/OutpostTooltipStyles.css";

import { ClickWrapper } from "../clickWrapper";

import { useDojo } from "../../hooks/useDojo";

import { getComponentValueStrict, EntityIndex, runQuery,getEntitiesWithValue, HasValue, updateComponent } from "@latticexyz/recs";
import { useEntityQuery, useComponentValue } from "@latticexyz/react";

import { ConfirmEventOutpost } from "../../dojo/types";

import { setTooltipArray } from "../../phaser/systems/eventSystems/eventEmitter";
import { fetchSpecificOutRevData, namesArray, setComponentsFromGraphQlEntitiesHM, surnamesArray, truncateString, turnBigIntToAddress } from "../../utils";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { GAME_CONFIG_ID } from "../../utils/settingsConstants";

interface OutpostTooltipProps { 
  confirm_event_outpost:any;
  contractComponents: any;
  clientComponents: any;
  graphSdk: any;
  account: any;
}

export const OutpostTooltipComponent: React.FC<OutpostTooltipProps> = ({contractComponents, clientComponents, graphSdk, account, confirm_event_outpost }) => {
  const [clickedOnOutposts, setClickedOnOutposts] = useState<any>([]);
  const [selectedIndex, setSelectedIndex] = useState<any>(0);

  const clientGameData = getComponentValueStrict(clientComponents.ClientGameData, getEntityIdFromKeys([BigInt(GAME_CONFIG_ID)]));
  const selectedOutpost = useEntityQuery([HasValue(clientComponents.ClientOutpostData, { selected: true })], { updateOnValueChange: false, });

  const changeSelectedIndex = (value: number) => {
    if (clickedOnOutposts.length === 0) { return; }

    let newIndex = selectedIndex + value;

    if (newIndex < 0) {
      newIndex = clickedOnOutposts.length - 1;
    }
    else if (newIndex >= clickedOnOutposts.length) {
      newIndex = 0;
    }

    updateComponent(clientComponents.ClientOutpostData, clickedOnOutposts[selectedIndex], { selected: false });
    updateComponent(clientComponents.ClientOutpostData, clickedOnOutposts[newIndex], { selected: true });

    setSelectedIndex(newIndex);
  }
  const setArray = async (selectedOutposts: any[]) => {

    for (let index = 0; index < clickedOnOutposts.length; index++) {
      const entity_id = clickedOnOutposts[index];

      updateComponent(clientComponents.ClientOutpostData, entity_id, { selected: false });
    }

    if (selectedOutposts.length === 0) {
      setClickedOnOutposts([]);
      return;
    }

    setClickedOnOutposts(selectedOutposts);

    for (let index = 0; index < selectedOutposts.length; index++) {
      const entity_id = selectedOutposts[index];
      const outpostData = getComponentValueStrict(contractComponents.Outpost, entity_id);
      const outpostModelQuery = await fetchSpecificOutRevData(graphSdk, clientGameData.current_game_id, Number(outpostData.entity_id));
      setComponentsFromGraphQlEntitiesHM(outpostModelQuery, contractComponents, false);
    }

    setSelectedIndex(0);

    updateComponent(clientComponents.ClientOutpostData, selectedOutposts[0], { selected: true });
  }
  const desmountComponentAction = () => {
    const entitiesAtTileIndex = getEntitiesWithValue(clientComponents.ClientOutpostData, {selected: true});

    if (entitiesAtTileIndex.length > 0) {

      updateComponent(clientComponents.ClientOutpostData, entitiesAtTileIndex[0], { selected: false });
    }
  }

  useEffect(() => {
    setTooltipArray.on("setToolTipArray", setArray);

    return () => {
      setTooltipArray.off("setToolTipArray", setArray);
    };

  }, [clickedOnOutposts]);

  useEffect(() => {

    return () => {
      desmountComponentAction()
    };
  }, []);

  if (clickedOnOutposts.length === 0) { return <div></div>; }

  return (
    <div className="outpost-tooltip-container" >

      {selectedOutpost[0] !== undefined && (
        <OutpostDataElement
          entityId={selectedOutpost[0]}
          functionEvent={confirm_event_outpost}
          functionClose={setArray} 
          clientComponents={clientComponents}
          contractComponents={contractComponents}
          account={account}
          />
      )}

      {selectedOutpost[0] !== undefined && (
        <RevenantDataElement
          entityId={selectedOutpost[0]}
          contractComponents={contractComponents}
          account={account} 
        />
      )}

      {clickedOnOutposts.length > 1 && (
        <ClickWrapper className="multi-out-container">

          <div className="pointer" style={{ gridColumn: "1/2", display: "flex", justifyContent: "flex-end", alignItems: "center" }} onClick={() => changeSelectedIndex(-1)}>
            <img src="Icons/left-arrow.png" style={{ width: "clamp(0.3rem, 0.4vw + 0.4rem, 3rem)", aspectRatio: "1/1" }}></img>
          </div>

          <div className="pointer test-h4" style={{ gridColumn: "2/4", display: "flex", justifyContent: "center", alignItems: "center" }}>
            Outposts: {selectedIndex + 1}/{clickedOnOutposts.length}
          </div>

          <div className="pointer" style={{ gridColumn: "4/5", display: "flex", justifyContent: "flex-start", alignItems: "center" }} onClick={() => changeSelectedIndex(1)}>
            <img src="Icons/right-arrow.png" style={{ width: "clamp(0.3rem, 0.4vw + 0.4rem, 3rem)", aspectRatio: "1/1" }}></img>
          </div>

        </ClickWrapper>
      )}

    </div>
  );
};

const RevenantDataElement: React.FC<{ entityId: EntityIndex, account :any, contractComponents :any }> = ({ entityId, account, contractComponents }) => {

  const [owner, setOwner] = useState<string>("");
  const [name, setName] = useState<string>("");

  const revenantData: any = useComponentValue(contractComponents.Revenant, entityId);

  useEffect(() => {

    const address = turnBigIntToAddress(revenantData.owner)

    if (address === account.address) {
      setOwner("You");
    }
    else {
      setOwner(address);
    }

    const name = namesArray[revenantData.first_name_idx] + " " + surnamesArray[revenantData.last_name_idx];

    setName(name);
  }, [revenantData]);

  return (
    <div className="revenant-data-container">
      <h2 className="no-margin test-h2" style={{ fontFamily: "Zelda", marginBottom: "5px" }}>REVENANT DATA</h2>
      <h4 className="no-margin test-h4">Owner: {owner === "You" ? "You" : truncateString(owner, 5)}</h4>
      <h4 className="no-margin test-h4">Name: {name}</h4>
    </div>
  );
};

const OutpostDataElement: React.FC<{ entityId: EntityIndex, functionEvent, functionClose, clientComponents, contractComponents, account  }> = ({ entityId, functionEvent, functionClose, clientComponents, contractComponents, account }) => {

  const [position, setPosition] = useState<any>({ x: 0, y: 0 });
  const [reinforcements, setReinforcements] = useState<number>(0);
  const [state, setState] = useState<string>("");
  const [id, setId] = useState<number>(0);
  const [shields, setShield] = useState<number>(0);

  const [heightValue, setHeight] = useState<number>(0)

  const clickWrapperRef = useRef<HTMLDivElement>(null);

  const clientOutpostData = useComponentValue(clientComponents.ClientOutpostData, entityId);
  const contractOutpostData = useComponentValue(contractComponents.Outpost, entityId);

  const clientGameData = getComponentValueStrict(clientComponents.ClientGameData, getEntityIdFromKeys([BigInt(GAME_CONFIG_ID)]));

  useEffect(() => {
    const updateHeight = () => {
      if (clickWrapperRef.current) {
        setHeight((clickWrapperRef.current.offsetWidth / 6) * (state === "In Event" ? 8 : 7));
      }
    };

    window.addEventListener('resize', updateHeight);

    updateHeight();

    return () => {
      window.removeEventListener('resize', updateHeight);
    };
  }, [state]);

  useEffect(() => {

    setPosition({ x: contractOutpostData!.x, y: contractOutpostData!.y });
    setReinforcements(contractOutpostData!.lifes);

    setId(Number(contractOutpostData!.entity_id));
    setShield(contractOutpostData!.shield);

    if (contractOutpostData!.lifes === 0) {
      setState("Dead");
    }
    else if (clientOutpostData!.event_effected) {
      setState("In Event");
    }
    else {
      setState("Healthy");
    }
  }, [contractOutpostData]);

  //HERE this should be standardised

  const clickWrapperStyle: React.CSSProperties = {
    height: `${heightValue}px`,
    width: '100%',
  };

  const confirmEvent = async () => {
    const gameTrackerData = getComponentValueStrict(contractComponents.GameEntityCounter, getEntityIdFromKeys([BigInt(clientGameData.current_game_id)]));

    const confirmEventProps: ConfirmEventOutpost = {
      account: account,
      game_id: clientGameData.current_game_id,
      event_id: gameTrackerData.event_count,
      outpost_id: id,
    };

    await functionEvent(confirmEventProps);
  }
  return (
    <div className="outpost-data-container-grid" ref={clickWrapperRef} style={{ ...clickWrapperStyle, gridTemplateRows: `${state !== "In Event" ? "repeat(7, 1fr)" : "repeat(8, 1fr)"}` }}>
      <div className="outpost-data-title-grid-element outpost-grid-container-text-style">
        <h2 className="no-margin test-h2" style={{ fontFamily: "Zelda" }}>OUTPOST DATA</h2>
      </div>

      <ClickWrapper className="outpost-data-x-grid-element center-via-flex" >
        <img src="Icons/close_icon.png" className="pointer" onClick={() => { functionClose([]) }} style={{ width: "clamp(0.8rem, 0.7vw + 0.7rem, 7rem)", height: "clamp(0.8rem, 0.7vw + 0.7rem, 7rem)" }} />
      </ClickWrapper>

      <div className="outpost-data-out-pic-grid-element">
        <img src="Misc/test_out_pp.png" style={{ width: "100%", height: "100%" }} />
      </div>
      <div className="outpost-data-shield-grid-element shields-grid-container" style={{ boxSizing: "border-box" }}>
        {Array.from({ length: shields }).map((_, index) => (
          <img key={index} src="SHIELD.png" className="img-full-style" />
        ))}
      </div>

      <div className="outpost-data-statistics-grid-element outpost-grid-container-text-style">
        <h4 className="no-margin test-h4" style={{ whiteSpace: "nowrap" }} >{id} ID - X:{position.x} || Y:{position.y}</h4>
        <h4 className="no-margin test-h4" >Reinforcements: {reinforcements}</h4>
        <h4 className="no-margin test-h4" >State:
          {state === "Dead" && <span style={{ color: "red" }}> {state}</span>}
          {state === "In Event" && <span style={{ color: "#2A71AA" }}> {state}</span>}
          {state === "Healthy" && <span style={{ color: "green" }}> {state}</span>}
        </h4>
      </div>

      {state === "In Event" && !clientGameData.guest &&
        <ClickWrapper className="outpost-data-conf-button-grid-element outpost-grid-container-text-style" style={{ display: "flex" }}>
          <div className="global-button-style invert-colors  invert-colors no-margin test-h4" style={{ padding: "3px 10px", display: "inline-block", alignSelf: "start" }} onClick={confirmEvent}>Validate Event</div>
        </ClickWrapper>
      }

    </div>
  );
};


