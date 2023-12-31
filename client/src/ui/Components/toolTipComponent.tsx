import React, { useState, useEffect, useRef } from "react";

import "./ComponentsStyles/OutpostTooltipStyles.css";

import { ClickWrapper } from "../clickWrapper";

import { useDojo } from "../../hooks/useDojo";

import { getComponentValueStrict, EntityIndex, runQuery, HasValue } from "@latticexyz/recs";
import { useEntityQuery, useComponentValue } from "@latticexyz/react";

import { ConfirmEventOutpost } from "../../dojo/types";

import { setTooltipArray } from "../../phaser/systems/eventSystems/eventEmitter";
import { fetchSpecificOutRevData, namesArray, setClientOutpostComponent, setComponentsFromGraphQlEntitiesHM, surnamesArray, truncateString } from "../../utils";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { GAME_CONFIG_ID } from "../../utils/settingsConstants";

interface OutpostTooltipProps { }

//HERE the X on the side is not correct also the size is not correct
// ALSO on the selected update data THIS SHOULD BE DONE
// THHERE IS ALSO THE ISSUE THAT THE TOOLTIP DOES NOT GET UPDATE 

export const OutpostTooltipComponent: React.FC<OutpostTooltipProps> = ({ }) => {
  const [clickedOnOutposts, setClickedOnOutposts] = useState<any>([]);
  const [selectedIndex, setSelectedIndex] = useState<any>(0);

  const {
    networkLayer: {
      systemCalls: {
        confirm_event_outpost
      },
      network: { contractComponents, clientComponents, graphSdk },
    },
  } = useDojo();

  const clientGameData = getComponentValueStrict(clientComponents.ClientGameData, getEntityIdFromKeys([BigInt(GAME_CONFIG_ID)]));
  const selectedOutpost = useEntityQuery([HasValue(clientComponents.ClientOutpostData, { selected: true })]);

  const changeSelectedIndex = (value: number) => {
    if (clickedOnOutposts.length === 0) { return; }

    let newIndex = selectedIndex + value;

    if (newIndex < 0) {
      newIndex = clickedOnOutposts.length - 1;
    }
    else if (newIndex >= clickedOnOutposts.length) {
      newIndex = 0;
    }

    const oldSelectedOutpost = getComponentValueStrict(clientComponents.ClientOutpostData, clickedOnOutposts[selectedIndex]);
    oldSelectedOutpost.selected = false;
    setClientOutpostComponent(oldSelectedOutpost.id, oldSelectedOutpost.owned, oldSelectedOutpost.event_effected, oldSelectedOutpost.selected, oldSelectedOutpost.visible, clientComponents, contractComponents, clientGameData.current_game_id)

    const newSelectedOutpost = getComponentValueStrict(clientComponents.ClientOutpostData, clickedOnOutposts[newIndex]);
    newSelectedOutpost.selected = true;
    setClientOutpostComponent(newSelectedOutpost.id, newSelectedOutpost.owned, newSelectedOutpost.event_effected, true, newSelectedOutpost.visible, clientComponents, contractComponents, clientGameData.current_game_id)

    setSelectedIndex(newIndex);
  }

  const setArray = async (selectedOutposts: any[]) => {

    console.error("this si working ")

    for (let index = 0; index < clickedOnOutposts.length; index++) {
      const entity_id = clickedOnOutposts[index];
      const clientOutpostData = getComponentValueStrict(clientComponents.ClientOutpostData, entity_id);
      setClientOutpostComponent(clientOutpostData.id, clientOutpostData.owned, clientOutpostData.event_effected, false, clientOutpostData.visible, clientComponents, contractComponents, clientGameData.current_game_id)
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

    const clientCompData = getComponentValueStrict(clientComponents.ClientOutpostData, selectedOutposts[0]);
    setClientOutpostComponent(clientCompData.id, clientCompData.owned, clientCompData.event_effected, true, clientCompData.visible, clientComponents, contractComponents, clientGameData.current_game_id)
  }

  useEffect(() => {

    setTooltipArray.on("setToolTipArray", setArray);

    return () => {
      setTooltipArray.off("setToolTipArray", setArray);
    };

  }, [clickedOnOutposts]);

  const desmountComponentAction = () => {
    const entitiesAtTileIndex = Array.from(runQuery([HasValue(clientComponents.ClientOutpostData, { selected: true })]));

    if (entitiesAtTileIndex.length > 0)
    {
      const clientCompData = getComponentValueStrict(clientComponents.ClientOutpostData, entitiesAtTileIndex[0]);
      setClientOutpostComponent(clientCompData.id, clientCompData.owned, clientCompData.event_effected, false, clientCompData.visible, clientComponents, contractComponents, clientGameData.current_game_id);
    }
  }

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
          functionClose={setArray} />
      )}

      {selectedOutpost[0] !== undefined && (
        <RevenantDataElement
          entityId={selectedOutpost[0]} />
      )}


        {/* HERE change to the pictures */}
      {clickedOnOutposts.length > 1 && (
        <ClickWrapper className="multi-out-container">

          <div className="pointer" style={{ gridColumn: "1/2", display: "flex", justifyContent: "flex-end", alignItems: "center" }} onClick={() => changeSelectedIndex(-1)}>
            {"<"}
          </div>

          <div className="pointer" style={{ gridColumn: "2/4", display: "flex", justifyContent: "center", alignItems: "center" }}>
            Outposts: {selectedIndex + 1}/{clickedOnOutposts.length}
          </div>

          <div className="pointer" style={{ gridColumn: "4/5", display: "flex", justifyContent: "flex-start", alignItems: "center" }} onClick={() => changeSelectedIndex(1)}>
            {">"}
          </div>

        </ClickWrapper>
      )}

    </div>
  );
};

const RevenantDataElement: React.FC<{ entityId: EntityIndex }> = ({ entityId }) => {

  const [owner, setOwner] = useState<string>("");
  const [name, setName] = useState<string>("");

  const {
    account: { account },
    networkLayer: {
      network: { contractComponents },
    },
  } = useDojo();

  const revenantData = useComponentValue(contractComponents.Revenant, entityId);

  useEffect(() => {

    if (revenantData.owner === account.address) {
      setOwner("You");
    }
    else {
      setOwner(revenantData.owner);
    }

    const name = namesArray[revenantData.first_name_idx] + " " + surnamesArray[revenantData.last_name_idx];

    setName(name);
  }, [revenantData]);

  return (
    <div className="revenant-data-container">
      <h2 className="no-margin test-h2" style={{ fontFamily: "Zelda", marginBottom:"5px" }}>REVENANT DATA</h2>
      <h4 className="no-margin test-h4">Owner: {owner === "You" ? "You" : truncateString(owner, 5)}</h4>
      <h4 className="no-margin test-h4">Name: {name}</h4>
    </div>
  );
};

const OutpostDataElement: React.FC<{ entityId: EntityIndex, functionEvent, functionClose }> = ({ entityId, functionEvent, functionClose }) => {

  const [position, setPosition] = useState<any>({ x: 0, y: 0 });
  const [reinforcements, setReinforcements] = useState<number>(0);
  const [state, setState] = useState<string>("");
  const [id, setId] = useState<number>(0);
  const [shields, setShield] = useState<number>(0);

  const [heightValue, setHeight] = useState<number>(0)

  const clickWrapperRef = useRef<HTMLDivElement>(null);

  const {
    account: { account },
    networkLayer: {
      network: { contractComponents, clientComponents },
    },
  } = useDojo();

  const clientOutpostData = useComponentValue(clientComponents.ClientOutpostData, entityId);
  const contractOutpostData = useComponentValue(contractComponents.Outpost, entityId);
  
  const clientGameData = getComponentValueStrict(clientComponents.ClientGameData, getEntityIdFromKeys([BigInt(GAME_CONFIG_ID)]));

  //HERE add use query for the auto sizing altouhg i think its not going to work as it is different here

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

    setPosition({ x: contractOutpostData.x, y: contractOutpostData.y });
    setReinforcements(contractOutpostData.lifes);

    setId(Number(contractOutpostData.entity_id));
    setShield(contractOutpostData.shield);

    if (contractOutpostData.lifes === 0) {
      setState("Dead");
    }
    else if (clientOutpostData.event_effected) {
      setState("In Event");
    }
    else {
      setState("Healthy");
    }
  }, [contractOutpostData]);

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
    <div className="outpost-data-container-grid" ref={clickWrapperRef} style={{...clickWrapperStyle, gridTemplateRows:`${state !== "In Event" ? "repeat(7, 1fr)" : "repeat(8, 1fr)"}`}}>
      <div className="outpost-data-title-grid-element outpost-grid-container-text-style">
        <h2 className="no-margin test-h2" style={{ fontFamily: "Zelda" }}>OUTPOST DATA</h2>
      </div>

      <ClickWrapper className="outpost-data-x-grid-element center-via-flex" >
        <img src="close_icon.png" className="pointer" onClick={() => { functionClose([]) }} style={{ width: "clamp(0.8rem, 0.7vw + 0.7rem, 7rem)", height: "clamp(0.8rem, 0.7vw + 0.7rem, 7rem)" }}/>
      </ClickWrapper>

      <div className="outpost-data-out-pic-grid-element">
        <img src="test_out_pp.png" style={{ width: "100%", height: "100%" }} />
      </div>
      <div className="outpost-data-shield-grid-element shields-grid-container" style={{ boxSizing: "border-box" }}>
        {Array.from({ length: shields }).map((_, index) => (
          <img key={index} src="SHIELD.png" className="img-full-style" />
        ))}
      </div>

      <div className="outpost-data-statistics-grid-element outpost-grid-container-text-style">
        <h4 className="no-margin test-h4" style={{ whiteSpace:"nowrap"  }} >{id} ID - X:{position.x} || Y:{position.y}</h4>
        <h4  className="no-margin test-h4" >Reinforcements: {reinforcements}</h4>
        <h4 className="no-margin test-h4" >State:
          {state === "Dead" && <span style={{ color: "red" }}> {state}</span>}
          {state === "In Event" && <span style={{ color: "#2A71AA" }}> {state}</span>}
          {state === "Healthy" && <span style={{ color: "green" }}> {state}</span>}
        </h4>
      </div>

      {state === "In Event" && !clientGameData.guest && 
        <ClickWrapper className="outpost-data-conf-button-grid-element outpost-grid-container-text-style" style={{display:"flex"}}>
          <div className="global-button-style no-margin test-h4" style={{ padding: "3px 10px", display:"inline-block", alignSelf:"start"  }} onClick={confirmEvent}>Validate Event</div>
        </ClickWrapper>
      }
     
    </div>
  );
};


/*notes
  this component should have an event that takes a list of entity ids and start by displaying the first one

  if more it should show a counter like elemnt at the bottom that allows the user to navigate through the list

  the only thing that changes between outposts is the state at whihc they are at

  this component should also deal wiht the setting of the selected outpost and the deselection of the previous one so highlight it

the update of the outpost will be done on demand from the clicking on them so this will be done here, when an outpost is selecet it will query it self to update its data
*/

